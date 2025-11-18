import { Controller, Post, Body, Headers, RawBodyRequest, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentGatewayFactory } from '../payments/strategies/payment-gateway.factory';
import { EventPublisher } from '../events/event-publisher.service';
import { PrismaService } from '../database/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private gatewayFactory: PaymentGatewayFactory,
    private eventPublisher: EventPublisher,
    private prisma: PrismaService,
  ) {}

  /**
   * Handle Stripe webhooks
   * Processes payment events from Stripe
   */
  @Post('stripe')
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const gateway = this.gatewayFactory.getGateway('stripe');

    try {
      // Verify webhook signature
      const event = gateway.verifyWebhook(request.rawBody, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object);
          break;

        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error.message);
      throw new BadRequestException('Webhook verification failed');
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransactionId: paymentIntent.id },
    });

    if (transaction) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.SUCCESS,
          gatewayResponse: paymentIntent,
        },
      });

      await this.eventPublisher.publish('payment.succeeded', {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        storeId: transaction.storeId,
        amount: transaction.amount,
        currency: transaction.currency,
      });
    }
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransactionId: paymentIntent.id },
    });

    if (transaction) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILURE,
          errorCode: paymentIntent.last_payment_error?.code,
          errorMessage: paymentIntent.last_payment_error?.message,
          gatewayResponse: paymentIntent,
        },
      });

      await this.eventPublisher.publish('payment.failed', {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        storeId: transaction.storeId,
        error: paymentIntent.last_payment_error?.message,
      });
    }
  }

  private async handleRefund(charge: any) {
    // Find the original transaction
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransactionId: charge.payment_intent },
    });

    if (transaction) {
      await this.eventPublisher.publish('payment.refund.completed', {
        orderId: transaction.orderId,
        storeId: transaction.storeId,
        amount: charge.amount_refunded / 100,
        currency: charge.currency,
      });
    }
  }
}
