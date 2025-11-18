import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Event Subscribers Service
 * Implements Observer Pattern - subscribes to business events
 */
@Injectable()
export class EventSubscribersService implements OnModuleInit {
  private readonly logger = new Logger(EventSubscribersService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  async onModuleInit() {
    await this.subscribeToEvents();
  }

  /**
   * Subscribe to all relevant business events
   */
  private async subscribeToEvents(): Promise<void> {
    this.logger.log('Subscribing to business events...');

    // In production, these would be RabbitMQ consumers
    // For now, we're setting up the structure

    // this.subscribeToOrderEvents();
    // this.subscribeToPaymentEvents();
    // this.subscribeToShippingEvents();
    // this.subscribeToUserEvents();

    this.logger.log('Event subscriptions initialized');
  }

  /**
   * Handle Order Created event
   */
  async handleOrderCreated(event: any): Promise<void> {
    try {
      const { order, customer, storeId } = event;

      await this.notificationsService.sendNotification(
        'email',
        customer.email,
        'order.created',
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          currency: order.currency,
        },
        {
          userId: customer.id,
          storeId,
          metadata: { orderId: order.id },
        },
      );

      this.logger.log(`Order created notification sent for order ${order.id}`);
    } catch (error) {
      this.logger.error('Failed to handle OrderCreated event', error);
    }
  }

  /**
   * Handle Order Shipped event
   */
  async handleOrderShipped(event: any): Promise<void> {
    try {
      const { order, customer, tracking, storeId } = event;

      await this.notificationsService.sendMultiChannel(
        ['email', 'sms'],
        customer.email,
        'order.shipped',
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          orderNumber: order.orderNumber,
          trackingNumber: tracking.number,
          deliveryDate: tracking.estimatedDelivery,
        },
        {
          userId: customer.id,
          storeId,
          metadata: { orderId: order.id },
        },
      );

      this.logger.log(`Order shipped notification sent for order ${order.id}`);
    } catch (error) {
      this.logger.error('Failed to handle OrderShipped event', error);
    }
  }

  /**
   * Handle Payment Success event
   */
  async handlePaymentSuccess(event: any): Promise<void> {
    try {
      const { payment, customer, storeId } = event;

      await this.notificationsService.sendNotification(
        'email',
        customer.email,
        'payment.success',
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          amount: payment.amount,
          currency: payment.currency,
          transactionId: payment.id,
        },
        {
          userId: customer.id,
          storeId,
          metadata: { paymentId: payment.id },
        },
      );

      this.logger.log(`Payment success notification sent for payment ${payment.id}`);
    } catch (error) {
      this.logger.error('Failed to handle PaymentSuccess event', error);
    }
  }

  /**
   * Handle User Registered event
   */
  async handleUserRegistered(event: any): Promise<void> {
    try {
      const { user } = event;

      await this.notificationsService.sendNotification(
        'email',
        user.email,
        'user.registered',
        {
          firstName: user.firstName,
          lastName: user.lastName,
          verificationLink: `${process.env.APP_URL}/verify?token=${user.verificationToken}`,
        },
        {
          userId: user.id,
          metadata: { userId: user.id },
        },
      );

      this.logger.log(`Welcome notification sent to user ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to handle UserRegistered event', error);
    }
  }

  /**
   * Handle Password Reset Requested event
   */
  async handlePasswordResetRequested(event: any): Promise<void> {
    try {
      const { user, token } = event;

      await this.notificationsService.sendNotification(
        'email',
        user.email,
        'password.reset',
        {
          firstName: user.firstName,
          resetLink: `${process.env.APP_URL}/reset-password?token=${token}`,
        },
        {
          userId: user.id,
          metadata: { userId: user.id },
        },
      );

      this.logger.log(`Password reset notification sent to user ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to handle PasswordResetRequested event', error);
    }
  }

  /**
   * Handle Low Stock Alert event
   */
  async handleLowStockAlert(event: any): Promise<void> {
    try {
      const { product, variant, storeId, threshold } = event;

      // Notify store owner
      await this.notificationsService.sendNotification(
        'email',
        event.storeOwnerEmail,
        'inventory.low_stock',
        {
          productName: product.title,
          variantTitle: variant.title,
          currentStock: variant.inventoryQty,
          threshold,
        },
        {
          storeId,
          metadata: { productId: product.id, variantId: variant.id },
        },
      );

      this.logger.log(`Low stock alert sent for product ${product.id}`);
    } catch (error) {
      this.logger.error('Failed to handle LowStockAlert event', error);
    }
  }
}
