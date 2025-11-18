import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  IPaymentGateway,
  PaymentIntent,
  PaymentResult,
  RefundResult,
} from './payment-gateway.interface';

/**
 * Strategy Pattern: Stripe Gateway Implementation
 * Adapter Pattern: Adapts Stripe API to our payment gateway interface
 */
@Injectable()
export class StripeGatewayStrategy implements IPaymentGateway {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      capture_method: 'manual', // Require explicit capture
    });

    return {
      id: intent.id,
      clientSecret: intent.client_secret,
      amount: intent.amount / 100,
      currency: intent.currency,
      status: intent.status,
    };
  }

  async capturePayment(intentId: string): Promise<PaymentResult> {
    try {
      const intent = await this.stripe.paymentIntents.capture(intentId);

      return {
        success: intent.status === 'succeeded',
        transactionId: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency,
        status: intent.status,
        rawResponse: intent,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: intentId,
        amount: 0,
        currency: '',
        status: 'failed',
        error: error.message,
      };
    }
  }

  async refundPayment(
    transactionId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: reason as any,
      });

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        rawResponse: refund,
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: error.message,
      };
    }
  }

  verifyWebhook(payload: any, signature: string): any {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }
}
