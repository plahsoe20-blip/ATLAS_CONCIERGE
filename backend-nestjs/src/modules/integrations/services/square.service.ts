import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Environment, ApiError } from 'square';
import { randomUUID } from 'crypto';

@Injectable()
export class SquareService {
  private readonly logger = new Logger(SquareService.name);
  private client: Client;
  private locationId: string;

  constructor(private configService: ConfigService) {
    const environment =
      this.configService.get('SQUARE_ENVIRONMENT') === 'production'
        ? Environment.Production
        : Environment.Sandbox;

    this.client = new Client({
      accessToken: this.configService.get('SQUARE_ACCESS_TOKEN'),
      environment,
    });

    this.locationId = this.configService.get('SQUARE_LOCATION_ID');
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

      return {
        id: payment.id,
        status: payment.status,
        amount: Number(payment.amountMoney?.amount) / 100,
        currency: payment.amountMoney?.currency,
        orderId: payment.orderId,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`);
      if (error instanceof ApiError) {
        throw new Error(error.errors?.[0]?.detail || 'Payment failed');
      }
      throw error;
    }
  }

  async capturePayment(paymentId: string) {
    try {
      const response = await this.client.paymentsApi.completePayment(paymentId);

      return {
        id: response.result.payment.id,
        status: response.result.payment.status,
      };
    } catch (error) {
      this.logger.error(`Failed to capture payment: ${error.message}`);
      if (error instanceof ApiError) {
        throw new Error(error.errors?.[0]?.detail || 'Capture failed');
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

      return {
        id: response.result.refund.id,
        status: response.result.refund.status,
        amount: Number(response.result.refund.amountMoney?.amount) / 100,
      };
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      if (error instanceof ApiError) {
        throw new Error(error.errors?.[0]?.detail || 'Refund failed');
      }
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    try {
      const response = await this.client.paymentsApi.getPayment(paymentId);

      const payment = response.result.payment;

      return {
        id: payment.id,
        status: payment.status,
        amount: Number(payment.amountMoney?.amount) / 100,
        currency: payment.amountMoney?.currency,
        orderId: payment.orderId,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get payment: ${error.message}`);
      throw error;
    }
  }

  async listPayments(beginTime?: string, endTime?: string) {
    try {
      const response = await this.client.paymentsApi.listPayments({
        locationId: this.locationId,
        beginTime,
        endTime,
        sortOrder: 'DESC',
        limit: 100,
      });

      return response.result.payments?.map((payment) => ({
        id: payment.id,
        status: payment.status,
        amount: Number(payment.amountMoney?.amount) / 100,
        currency: payment.amountMoney?.currency,
        createdAt: payment.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to list payments: ${error.message}`);
      throw error;
    }
  }
}
