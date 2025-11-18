import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { InventoryService } from '../inventory/inventory.service';

/**
 * Observer Pattern: Event Subscriber
 * Subscribes to business events from other services
 */
@Injectable()
export class EventSubscriber implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchange = 'ecomify.events';
  private readonly queueName = 'inventory-service-queue';

  constructor(private inventoryService: InventoryService) {}

  async onModuleInit() {
    await this.connect();
    await this.subscribe();
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      console.log('✅ Inventory Service connected to RabbitMQ for subscribing');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
    }
  }

  private async subscribe() {
    // Subscribe to order-related events
    await this.channel.bindQueue(this.queueName, this.exchange, 'order.created');
    await this.channel.bindQueue(this.queueName, this.exchange, 'order.cancelled');
    await this.channel.bindQueue(this.queueName, this.exchange, 'order.fulfilled');

    this.channel.consume(this.queueName, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await this.handleEvent(event);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing event:', error);
          this.channel.nack(msg, false, false); // Send to dead letter queue
        }
      }
    });

    console.log('👂 Inventory Service listening for events');
  }

  private async handleEvent(event: any) {
    console.log(`📥 Received event: ${event.eventType}`);

    switch (event.eventType) {
      case 'order.created':
        await this.handleOrderCreated(event.data);
        break;

      case 'order.cancelled':
        await this.handleOrderCancelled(event.data);
        break;

      case 'order.fulfilled':
        await this.handleOrderFulfilled(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.eventType}`);
    }
  }

  private async handleOrderCreated(data: any) {
    // Reserve inventory for the order
    if (data.lineItems && Array.isArray(data.lineItems)) {
      const items = data.lineItems.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      try {
        await this.inventoryService.reserveInventory({
          orderId: data.orderId,
          items,
        });
        console.log(`✅ Reserved inventory for order ${data.orderId}`);
      } catch (error) {
        console.error(`❌ Failed to reserve inventory for order ${data.orderId}:`, error.message);
      }
    }
  }

  private async handleOrderCancelled(data: any) {
    // Release inventory reservation
    try {
      await this.inventoryService.releaseReservationByOrder(data.orderId);
      console.log(`✅ Released inventory for cancelled order ${data.orderId}`);
    } catch (error) {
      console.error(`❌ Failed to release inventory for order ${data.orderId}:`, error.message);
    }
  }

  private async handleOrderFulfilled(data: any) {
    // Mark reservation as fulfilled (already deducted from available)
    try {
      await this.inventoryService.fulfillReservationByOrder(data.orderId);
      console.log(`✅ Fulfilled inventory for order ${data.orderId}`);
    } catch (error) {
      console.error(`❌ Failed to fulfill inventory for order ${data.orderId}:`, error.message);
    }
  }
}
