import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EventPublisher } from '../events/event-publisher.service';
import { PaymentGatewayFactory } from './strategies/payment-gateway.factory';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CapturePaymentDto } from './dto/capture-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { TransactionType, TransactionStatus } from '@prisma/client';

/**
 * Payment Service
 * Handles payment processing using Strategy pattern for different gateways
 */
@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher,
    private gatewayFactory: PaymentGatewayFactory,
  ) {}

  /**
   * Create a payment intent
   */
  async createIntent(dto: CreatePaymentIntentDto) {
    const gateway = this.gatewayFactory.getGateway('stripe');

    // Create payment intent with gateway
    const intent = await gateway.createIntent(
      dto.amount,
      dto.currency,
      {
        orderId: dto.orderId,
        storeId: dto.storeId,
        ...dto.metadata,
      }
    );

    // Record transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        orderId: dto.orderId,
        storeId: dto.storeId,
        gateway: 'stripe',
        type: TransactionType.AUTHORIZATION,
        status: TransactionStatus.PENDING,
        amount: dto.amount,
        currency: dto.currency,
        gatewayTransactionId: intent.id,
        gatewayResponse: intent as any,
        metadata: dto.metadata as any,
      },
    });

    // Publish event
    await this.eventPublisher.publish('payment.intent.created', {
      transactionId: transaction.id,
      orderId: dto.orderId,
      storeId: dto.storeId,
      amount: dto.amount,
      currency: dto.currency,
    });

    return {
      transactionId: transaction.id,
      clientSecret: intent.clientSecret,
      intentId: intent.id,
    };
  }

  /**
   * Capture a payment
   */
  async capturePayment(dto: CapturePaymentDto) {
    const gateway = this.gatewayFactory.getGateway('stripe');

    // Find the authorization transaction
    const authTransaction = await this.prisma.transaction.findFirst({
      where: {
        gatewayTransactionId: dto.intentId,
        type: TransactionType.AUTHORIZATION,
      },
    });

    if (!authTransaction) {
      throw new NotFoundException('Authorization transaction not found');
    }

    // Capture payment with gateway
    const result = await gateway.capturePayment(dto.intentId);

    if (!result.success) {
      // Record failed capture
      await this.prisma.transaction.update({
        where: { id: authTransaction.id },
        data: {
          status: TransactionStatus.FAILURE,
          errorMessage: result.error,
        },
      });

      throw new BadRequestException(result.error || 'Payment capture failed');
    }

    // Record successful capture
    const transaction = await this.prisma.transaction.create({
      data: {
        orderId: authTransaction.orderId,
        storeId: authTransaction.storeId,
        gateway: 'stripe',
        type: TransactionType.CAPTURE,
        status: TransactionStatus.SUCCESS,
        amount: result.amount,
        currency: result.currency,
        gatewayTransactionId: result.transactionId,
        gatewayResponse: result.rawResponse as any,
      },
    });

    // Update authorization status
    await this.prisma.transaction.update({
      where: { id: authTransaction.id },
      data: { status: TransactionStatus.SUCCESS },
    });

    // Publish event
    await this.eventPublisher.publish('payment.captured', {
      transactionId: transaction.id,
      orderId: authTransaction.orderId,
      storeId: authTransaction.storeId,
      amount: result.amount,
      currency: result.currency,
    });

    return transaction;
  }

  /**
   * Create a refund
   */
  async createRefund(dto: CreateRefundDto) {
    const gateway = this.gatewayFactory.getGateway('stripe');

    // Find the original transaction
    const originalTransaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!originalTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (originalTransaction.status !== TransactionStatus.SUCCESS) {
      throw new BadRequestException('Can only refund successful transactions');
    }

    // Process refund with gateway
    const result = await gateway.refundPayment(
      originalTransaction.gatewayTransactionId,
      dto.amount,
      dto.reason
    );

    if (!result.success) {
      throw new BadRequestException(result.error || 'Refund failed');
    }

    // Record refund transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        orderId: originalTransaction.orderId,
        storeId: originalTransaction.storeId,
        gateway: 'stripe',
        type: TransactionType.REFUND,
        status: TransactionStatus.SUCCESS,
        amount: result.amount,
        currency: originalTransaction.currency,
        gatewayTransactionId: result.refundId,
        gatewayResponse: result.rawResponse as any,
        metadata: dto.metadata as any,
      },
    });

    // Publish event
    await this.eventPublisher.publish('payment.refunded', {
      transactionId: transaction.id,
      originalTransactionId: dto.transactionId,
      orderId: originalTransaction.orderId,
      storeId: originalTransaction.storeId,
      amount: result.amount,
      currency: originalTransaction.currency,
      reason: dto.reason,
    });

    return transaction;
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get transactions by order ID
   */
  async getTransactionsByOrder(orderId: string) {
    return this.prisma.transaction.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get transactions by store ID
   */
  async getTransactionsByStore(storeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { storeId } }),
    ]);

    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}
