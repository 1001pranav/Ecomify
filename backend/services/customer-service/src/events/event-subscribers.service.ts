import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/**
 * Observer Pattern: Subscribes to events from other services
 * Updates customer metrics based on order events
 */
@Injectable()
export class EventSubscribersService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.subscribeToOrderEvents();
    console.log('📡 Customer event subscribers initialized');
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
    // - order.cancelled

    console.log('📦 Subscribed to order events');
  }

  /**
   * Handle order paid event
   * Updates customer's totalSpent and ordersCount
   */
  async handleOrderPaid(data: {
    customerId?: string;
    storeId: string;
    email: string;
    totalPrice: number;
  }) {
    if (!data.customerId) {
      // Try to find customer by email
      const customer = await this.prisma.customer.findUnique({
        where: {
          storeId_email: {
            storeId: data.storeId,
            email: data.email,
          },
        },
      });

      if (!customer) {
        // Customer doesn't exist, skip update
        return;
      }

      data.customerId = customer.id;
    }

    // Update customer metrics
    await this.prisma.customer.update({
      where: { id: data.customerId },
      data: {
        totalSpent: {
          increment: data.totalPrice,
        },
        ordersCount: {
          increment: 1,
        },
      },
    });

    console.log(`✅ Updated metrics for customer ${data.customerId}`);
  }

  /**
   * Handle order cancelled event
   * Decrements customer's totalSpent and ordersCount
   */
  async handleOrderCancelled(data: {
    customerId?: string;
    storeId: string;
    email: string;
    totalPrice: number;
    wasRefunded: boolean;
  }) {
    if (!data.customerId || !data.wasRefunded) {
      return;
    }

    // Update customer metrics (decrement)
    await this.prisma.customer.update({
      where: { id: data.customerId },
      data: {
        totalSpent: {
          decrement: data.totalPrice,
        },
        ordersCount: {
          decrement: 1,
        },
      },
    });

    console.log(`✅ Decremented metrics for customer ${data.customerId}`);
  }
}
