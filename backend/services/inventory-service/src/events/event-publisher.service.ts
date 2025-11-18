import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

/**
 * Observer Pattern: Event Publishing
 * Publishes inventory-related events to the message queue
 */
@Injectable()
export class EventPublisher {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchange = 'ecomify.events';

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      console.log('✅ Inventory Service connected to RabbitMQ for publishing');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
    }
  }

  async publish(eventType: string, data: any) {
    if (!this.channel) {
      await this.connect();
    }

    const event = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      service: 'inventory-service',
    };

    const routingKey = `inventory.${eventType}`;

    this.channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );

    console.log(`📤 Published event: ${routingKey}`);
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
