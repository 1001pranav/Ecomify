/**
 * Event Publisher Service - Observer Pattern
 * Publishes domain events to message queue
 */

import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  timestamp: Date;
  payload: any;
}

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'ecomify.events';

  async onModuleInit() {
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://localhost:5672'
      );
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true,
      });

      this.logger.log('Event publisher connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Event publisher disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  /**
   * Publish domain event
   */
  async publish(event: DomainEvent): Promise<void> {
    if (!this.channel) {
      this.logger.error('Channel not available, event not published:', event);
      return;
    }

    try {
      const routingKey = `store.${event.eventType}`;
      const message = JSON.stringify({
        ...event,
        timestamp: event.timestamp.toISOString(),
      });

      this.channel.publish(this.exchange, routingKey, Buffer.from(message), {
        persistent: true,
        contentType: 'application/json',
      });

      this.logger.log(`Event published: ${routingKey}`, event.aggregateId);
    } catch (error) {
      this.logger.error('Failed to publish event:', error);
    }
  }

  /**
   * Publish StoreCreated event
   */
  async publishStoreCreated(storeId: string, payload: any): Promise<void> {
    await this.publish({
      eventType: 'created',
      aggregateId: storeId,
      timestamp: new Date(),
      payload,
    });
  }

  /**
   * Publish StoreUpdated event
   */
  async publishStoreUpdated(storeId: string, payload: any): Promise<void> {
    await this.publish({
      eventType: 'updated',
      aggregateId: storeId,
      timestamp: new Date(),
      payload,
    });
  }

  /**
   * Publish StoreStatusChanged event
   */
  async publishStoreStatusChanged(storeId: string, payload: any): Promise<void> {
    await this.publish({
      eventType: 'status.changed',
      aggregateId: storeId,
      timestamp: new Date(),
      payload,
    });
  }

  /**
   * Publish ThemeUpdated event
   */
  async publishThemeUpdated(storeId: string, payload: any): Promise<void> {
    await this.publish({
      eventType: 'theme.updated',
      aggregateId: storeId,
      timestamp: new Date(),
      payload,
    });
  }
}
