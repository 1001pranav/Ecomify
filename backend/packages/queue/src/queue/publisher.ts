/**
 * Event Publisher - Observer Pattern
 *
 * Publishes events to RabbitMQ following the Observer pattern
 */

import { Channel } from 'amqplib';
import { QueueConnection, getQueueConnection } from './connection';
import { QueueMessage, PublisherOptions } from '../types';

/**
 * Event Publisher class
 */
export class EventPublisher {
  private connection: QueueConnection;
  private channel: Channel | null = null;

  constructor(private options: PublisherOptions) {
    this.connection = getQueueConnection();
  }

  /**
   * Initialize publisher
   */
  public async initialize(): Promise<void> {
    if (!this.connection.isConnectionActive()) {
      await this.connection.connect();
    }

    this.channel = this.connection.getChannel();

    // Assert exchange
    await this.channel.assertExchange(
      this.options.exchange,
      this.options.exchangeType || 'topic',
      {
        durable: this.options.durable !== false,
      },
    );

    console.log(`✓ Publisher initialized for exchange: ${this.options.exchange}`);
  }

  /**
   * Publish an event
   */
  public async publish<T = any>(
    event: string,
    data: T,
    correlationId?: string,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Publisher not initialized');
    }

    const message: QueueMessage<T> = {
      id: this.generateMessageId(),
      type: event,
      data,
      timestamp: new Date(),
      correlationId,
      metadata: {
        publisher: this.options.exchange,
      },
    };

    const content = Buffer.from(JSON.stringify(message));

    try {
      this.channel.publish(this.options.exchange, event, content, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
        messageId: message.id,
        correlationId,
      });

      console.log(`Event published: ${event}`, { messageId: message.id });
    } catch (error) {
      console.error(`Failed to publish event: ${event}`, error);
      throw error;
    }
  }

  /**
   * Publish multiple events
   */
  public async publishBatch<T = any>(
    events: Array<{ event: string; data: T }>,
  ): Promise<void> {
    for (const { event, data } of events) {
      await this.publish(event, data);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Close publisher
   */
  public async close(): Promise<void> {
    this.channel = null;
    console.log('✓ Publisher closed');
  }
}

/**
 * Create event publisher
 */
export function createPublisher(options: PublisherOptions): EventPublisher {
  return new EventPublisher(options);
}
