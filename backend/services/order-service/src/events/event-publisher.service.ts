import { Injectable, Logger } from '@nestjs/common';

/**
 * Observer Pattern - Event Publisher
 * Publishes domain events to message queue for other services to consume
 * This demonstrates loose coupling between services
 */
@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  async publish(eventType: string, data: any): Promise<void> {
    try {
      // TODO: Integrate with RabbitMQ/Message Queue
      // For now, log the events
      this.logger.log(`Publishing event: ${eventType}`, data);

      // In production, this would publish to message queue:
      // await this.queueService.publish(eventType, data);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${eventType}`, error);
      throw error;
    }
  }

  async publishOrderCreated(order: any): Promise<void> {
    await this.publish('order.created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      storeId: order.storeId,
      customerId: order.customerId,
      totalPrice: order.totalPrice,
      lineItems: order.lineItems,
      timestamp: new Date(),
    });
  }

  async publishOrderStatusChanged(order: any, previousStatus: any): Promise<void> {
    await this.publish('order.status_changed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousFinancialStatus: previousStatus.financialStatus,
      newFinancialStatus: order.financialStatus,
      previousFulfillmentStatus: previousStatus.fulfillmentStatus,
      newFulfillmentStatus: order.fulfillmentStatus,
      timestamp: new Date(),
    });
  }

  async publishOrderFulfilled(fulfillment: any): Promise<void> {
    await this.publish('order.fulfilled', {
      orderId: fulfillment.orderId,
      fulfillmentId: fulfillment.id,
      trackingNumber: fulfillment.trackingNumber,
      timestamp: new Date(),
    });
  }

  async publishOrderCancelled(order: any, reason?: string): Promise<void> {
    await this.publish('order.cancelled', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      reason,
      timestamp: new Date(),
    });
  }

  async publishOrderRefunded(refund: any): Promise<void> {
    await this.publish('order.refunded', {
      orderId: refund.orderId,
      refundId: refund.id,
      amount: refund.amount,
      restockItems: refund.restockItems,
      timestamp: new Date(),
    });
  }
}
