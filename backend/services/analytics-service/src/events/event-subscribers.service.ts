import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventCollectorService } from './event-collector.service';

/**
 * Observer Pattern: Subscribes to events from all business services
 * This service listens to RabbitMQ events and collects analytics data
 */
@Injectable()
export class EventSubscribersService implements OnModuleInit {
  constructor(private readonly eventCollector: EventCollectorService) {}

  async onModuleInit() {
    // Subscribe to all relevant business events
    await this.subscribeToOrderEvents();
    await this.subscribeToProductEvents();
    await this.subscribeToCustomerEvents();
    await this.subscribeToPaymentEvents();
    console.log('📡 Analytics event subscribers initialized');
  }

  /**
   * Subscribe to order-related events
   */
  private async subscribeToOrderEvents() {
    // In a real implementation, this would use @ecomify/queue
    // to subscribe to RabbitMQ topics

    // Example events:
    // - order.created
    // - order.paid
    // - order.fulfilled
    // - order.cancelled

    console.log('📦 Subscribed to order events');
  }

  /**
   * Subscribe to product-related events
   */
  private async subscribeToProductEvents() {
    // Example events:
    // - product.created
    // - product.viewed
    // - product.added_to_cart

    console.log('🏷️  Subscribed to product events');
  }

  /**
   * Subscribe to customer-related events
   */
  private async subscribeToCustomerEvents() {
    // Example events:
    // - customer.created
    // - customer.updated

    console.log('👤 Subscribed to customer events');
  }

  /**
   * Subscribe to payment-related events
   */
  private async subscribeToPaymentEvents() {
    // Example events:
    // - payment.processed
    // - payment.refunded

    console.log('💳 Subscribed to payment events');
  }

  /**
   * Handle order created event
   */
  async handleOrderCreated(data: any) {
    await this.eventCollector.collectEvent(
      data.storeId,
      'order.created',
      {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        totalPrice: data.totalPrice,
        currency: data.currency,
        itemCount: data.lineItems?.length || 0,
      },
    );
  }

  /**
   * Handle order paid event
   */
  async handleOrderPaid(data: any) {
    await this.eventCollector.collectEvent(
      data.storeId,
      'order.paid',
      {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
      },
    );
  }

  /**
   * Handle product viewed event
   */
  async handleProductViewed(data: any) {
    await this.eventCollector.collectEvent(
      data.storeId,
      'product.viewed',
      {
        productId: data.productId,
        variantId: data.variantId,
      },
    );
  }

  /**
   * Handle product added to cart event
   */
  async handleProductAddedToCart(data: any) {
    await this.eventCollector.collectEvent(
      data.storeId,
      'product.added_to_cart',
      {
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
      },
    );
  }
}
