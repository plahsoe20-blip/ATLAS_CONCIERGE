import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { SquareService } from '../integrations/services/square.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private squareService: SquareService,
  ) {}

  async create(companyId: string, createPaymentDto: CreatePaymentDto) {
    const { rideId, amount, method, ...paymentData } = createPaymentDto;

    // Verify ride exists
    if (rideId) {
      const ride = await this.prisma.ride.findFirst({
        where: { id: rideId, companyId },
      });

      if (!ride) {
        throw new NotFoundException('Ride not found');
      }
    }

    let squarePaymentId: string | undefined;
    let squareOrderId: string | undefined;

    // Process Square payment if method is SQUARE
    if (method === 'SQUARE') {
      try {
        const squarePayment = await this.squareService.createPayment(
          amount,
          paymentData.sourceId || '',
          createPaymentDto.description,
        );

        squarePaymentId = squarePayment.id;
        squareOrderId = squarePayment.orderId;
      } catch (error) {
        throw new BadRequestException(`Payment processing failed: ${error.message}`);
      }
    }

    return this.prisma.payment.create({
      data: {
        companyId,
        rideId,
        amount,
        method,
        status: method === 'CASH' ? 'COMPLETED' : 'AUTHORIZED',
        squarePaymentId,
        squareOrderId,
        ...paymentData,
      },
    });
  }

  async findAll(companyId: string, rideId?: string) {
    return this.prisma.payment.findMany({
      where: {
        companyId,
        ...(rideId && { rideId }),
      },
      include: {
        ride: {
          select: {
            id: true,
            passengerName: true,
            pickupAddress: true,
            dropoffAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, companyId },
      include: {
        ride: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async capture(id: string, companyId: string) {
    const payment = await this.findOne(id, companyId);

    if (payment.status !== 'AUTHORIZED') {
      throw new BadRequestException('Can only capture authorized payments');
    }

    // Capture via Square if it's a Square payment
    if (payment.method === 'SQUARE' && payment.squarePaymentId) {
      await this.squareService.capturePayment(payment.squarePaymentId);
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  async refund(id: string, companyId: string, refundDto: RefundPaymentDto) {
    const payment = await this.findOne(id, companyId);

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only refund completed payments');
    }

    const refundAmount = refundDto.amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // Process refund via Square if it's a Square payment
    if (payment.method === 'SQUARE' && payment.squarePaymentId) {
      await this.squareService.refundPayment(
        payment.squarePaymentId,
        refundAmount,
        refundDto.reason,
      );
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        refundAmount,
        refundedAt: new Date(),
        refundReason: refundDto.reason,
      },
    });
  }

  async getPaymentsByRide(rideId: string, companyId: string) {
    return this.prisma.payment.findMany({
      where: { rideId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
