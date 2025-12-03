import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

// Square SDK - using CommonJS require
const { SquareClient, SquareEnvironment } = require('square');

@Injectable()
export class SquareService {
  private readonly logger = new Logger(SquareService.name);
  private client: any;
  private locationId: string;

  constructor(private configService: ConfigService) {
    const environment =
      this.configService.get('SQUARE_ENVIRONMENT') === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox;

    this.client = new SquareClient({
      accessToken: this.configService.get('SQUARE_ACCESS_TOKEN') || '',
      environment: environment,
    });

    this.locationId = this.configService.get('SQUARE_LOCATION_ID') || '';
  }

  async createPayment(amount: number, sourceId: string, note?: string) {
    try {
      const idempotencyKey = randomUUID();

      const response = await this.client.paymentsApi.createPayment({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(Math.round(amount * 100)), // Convert to cents
          currency: 'USD',
        },
        locationId: this.locationId,
        ...(note && { note }),
        autocomplete: false, // Requires manual capture
      });

      const payment = response.result.payment;

      if (!payment) {
        throw new Error('Payment creation failed - no payment object returned');
      }

      return {
        id: payment.id || '',
        status: payment.status,
        amount: Number(payment.amountMoney?.amount || 0) / 100,
        currency: payment.amountMoney?.currency || 'USD',
        orderId: payment.orderId,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create payment: ${error.message}`);
      if (error.errors && Array.isArray(error.errors)) {
        throw new Error(error.errors[0]?.detail || 'Payment failed');
      }
      throw error;
    }
  }

  async capturePayment(paymentId: string) {
    try {
      const response = await this.client.paymentsApi.completePayment(paymentId, {});

      const payment = response.result.payment;
      if (!payment) {
        throw new Error('Payment capture failed - no payment object returned');
      }

      return {
        id: payment.id || '',
        status: payment.status,
      };
    } catch (error: any) {
      this.logger.error(`Failed to capture payment: ${error.message}`);
      if (error.errors && Array.isArray(error.errors)) {
        throw new Error(error.errors[0]?.detail || 'Payment capture failed');
      }
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount: number, reason?: string) {
    try {
      const idempotencyKey = randomUUID();

      const response = await this.client.refundsApi.refundPayment({
        idempotencyKey,
        paymentId,
        amountMoney: {
          amount: BigInt(Math.round(amount * 100)),
          currency: 'USD',
        },
        ...(reason && { reason }),
      });

      const refund = response.result.refund;
      if (!refund) {
        throw new Error('Refund failed - no refund object returned');
      }

      return {
        id: refund.id || '',
        status: refund.status,
        amount: Number(refund.amountMoney?.amount || 0) / 100,
      };
    } catch (error: any) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      if (error.errors && Array.isArray(error.errors)) {
        throw new Error(error.errors[0]?.detail || 'Refund failed');
      }
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    try {
      const response = await this.client.paymentsApi.getPayment(paymentId);

      const payment = response.result.payment;

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        id: payment.id || '',
        status: payment.status,
        amount: Number(payment.amountMoney?.amount || 0) / 100,
        currency: payment.amountMoney?.currency || 'USD',
        orderId: payment.orderId,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get payment: ${error.message}`);
      throw error;
    }
  }

  async listPayments(beginTime?: string, endTime?: string) {
    try {
      // Square SDK requires specific parameter structure
      const request: any = {
        locationId: this.locationId,
        sortOrder: 'DESC',
        limit: 100,
      };

      if (beginTime) request.beginTime = beginTime;
      if (endTime) request.endTime = endTime;

      const response = await this.client.paymentsApi.listPayments(request);

      return response.result.payments?.map((payment: any) => ({
        id: payment.id,
        status: payment.status,
        amount: Number(payment.amountMoney?.amount) / 100,
        currency: payment.amountMoney?.currency,
        createdAt: payment.createdAt,
      }));
    } catch (error: any) {
      this.logger.error(`Failed to list payments: ${error.message}`);
      throw error;
    }
  }
}
