import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

/**
 * Observer Pattern - Event Publisher for loosely coupled service communication
 * Publishes domain events to RabbitMQ for other services to consume
 */
@Injectable()
export class EventPublisherService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'ecomify.events';

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Service can still function without event publishing
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    this.connection = await amqp.connect(rabbitMQUrl);
    this.channel = await this.connection.createChannel();

    // Create exchange
    await this.channel.assertExchange(this.exchange, 'topic', {
      durable: true,
    });

    console.log('📨 Event Publisher connected to RabbitMQ');
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('📨 Event Publisher disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  /**
   * Publish an event to the message queue
   */
  async publish(eventType: string, payload: any): Promise<boolean> {
    if (!this.channel) {
      console.warn(`Event not published (no connection): ${eventType}`);
      return false;
    }

    try {
      const message = {
        eventType,
        payload,
        timestamp: new Date().toISOString(),
        service: 'product-service',
      };

      const routingKey = this.getRoutingKey(eventType);

      this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          contentType: 'application/json',
        },
      );

      console.log(`📤 Event published: ${eventType}`);
      return true;
    } catch (error) {
      console.error(`Failed to publish event ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Product Events
   */
  async publishProductCreated(product: any) {
    return this.publish('product.created', product);
  }

  async publishProductUpdated(product: any) {
    return this.publish('product.updated', product);
  }

  async publishProductDeleted(productId: string, storeId: string) {
    return this.publish('product.deleted', { productId, storeId });
  }

  async publishProductPublished(product: any) {
    return this.publish('product.published', product);
  }

  async publishProductArchived(product: any) {
    return this.publish('product.archived', product);
  }

  /**
   * Inventory Events (for other services to react to)
   */
  async publishInventoryChanged(variantId: string, quantity: number, storeId: string) {
    return this.publish('inventory.changed', { variantId, quantity, storeId });
  }

  /**
   * Category Events
   */
  async publishCategoryCreated(category: any) {
    return this.publish('category.created', category);
  }

  async publishCategoryUpdated(category: any) {
    return this.publish('category.updated', category);
  }

  async publishCategoryDeleted(categoryId: string, storeId: string) {
    return this.publish('category.deleted', { categoryId, storeId });
  }

  /**
   * Collection Events
   */
  async publishCollectionCreated(collection: any) {
    return this.publish('collection.created', collection);
  }

  async publishCollectionUpdated(collection: any) {
    return this.publish('collection.updated', collection);
  }

  async publishCollectionDeleted(collectionId: string, storeId: string) {
    return this.publish('collection.deleted', { collectionId, storeId });
  }

  /**
   * Generate routing key for topic exchange
   */
  private getRoutingKey(eventType: string): string {
    return eventType.replace('.', '.');
  }
}
