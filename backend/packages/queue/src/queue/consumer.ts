/**
 * Event Consumer - Observer Pattern
 *
 * Consumes events from RabbitMQ following the Observer pattern
 */

import { Channel, ConsumeMessage } from 'amqplib';
import { QueueConnection, getQueueConnection } from './connection';
import { QueueMessage, ConsumerOptions, EventHandler } from '../types';

/**
 * Event Consumer class implementing Observer pattern
 */
export class EventConsumer {
  private connection: QueueConnection;
  private channel: Channel | null = null;
  private handlers: Map<string, EventHandler> = new Map();
  private consumerTag: string | null = null;

  constructor(private options: ConsumerOptions) {
    this.connection = getQueueConnection();
  }

  /**
   * Initialize consumer
   */
  public async initialize(): Promise<void> {
    if (!this.connection.isConnectionActive()) {
      await this.connection.connect();
    }

    this.channel = this.connection.getChannel();

    // Set prefetch count
    await this.channel.prefetch(this.options.prefetch || 10);

    // Assert queue
    await this.channel.assertQueue(this.options.queue, {
      durable: true,
    });

    // Bind queue to exchange if provided
    if (this.options.exchange && this.options.routingKey) {
      await this.channel.assertExchange(this.options.exchange, 'topic', {
        durable: true,
      });
      await this.channel.bindQueue(
        this.options.queue,
        this.options.exchange,
        this.options.routingKey,
      );
    }

    console.log(`✓ Consumer initialized for queue: ${this.options.queue}`);
  }

  /**
   * Subscribe to events (Observer pattern)
   */
  public subscribe(event: string, handler: EventHandler): void {
    this.handlers.set(event, handler);
    console.log(`✓ Subscribed to event: ${event}`);
  }

  /**
   * Unsubscribe from events
   */
  public unsubscribe(event: string): void {
    this.handlers.delete(event);
    console.log(`✓ Unsubscribed from event: ${event}`);
  }

  /**
   * Start consuming messages
   */
  public async start(): Promise<void> {
    if (!this.channel) {
      throw new Error('Consumer not initialized');
    }

    const { consumerTag } = await this.channel.consume(
      this.options.queue,
      async (msg) => {
        if (!msg) return;

        try {
          await this.handleMessage(msg);

          // Acknowledge message if auto-ack is disabled
          if (!this.options.autoAck && this.channel) {
            this.channel.ack(msg);
          }
        } catch (error) {
          console.error('Error handling message:', error);

          // Reject and requeue message
          if (this.channel) {
            this.channel.nack(msg, false, true);
          }
        }
      },
      {
        noAck: this.options.autoAck || false,
      },
    );

    this.consumerTag = consumerTag;
    console.log(`✓ Consumer started for queue: ${this.options.queue}`);
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    try {
      const message: QueueMessage = JSON.parse(msg.content.toString());

      console.log(`Received event: ${message.type}`, {
        messageId: message.id,
        timestamp: message.timestamp,
      });

      // Find handler for this event type
      const handler = this.handlers.get(message.type);

      if (handler) {
        await handler.handle(message);
        console.log(`Event handled successfully: ${message.type}`);
      } else {
        console.warn(`No handler found for event: ${message.type}`);
      }
    } catch (error) {
      console.error('Failed to process message:', error);
      throw error;
    }
  }

  /**
   * Stop consuming messages
   */
  public async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
      this.consumerTag = null;
      console.log(`✓ Consumer stopped for queue: ${this.options.queue}`);
    }
  }

  /**
   * Close consumer
   */
  public async close(): Promise<void> {
    await this.stop();
    this.channel = null;
    this.handlers.clear();
    console.log('✓ Consumer closed');
  }
}

/**
 * Create event consumer
 */
export function createConsumer(options: ConsumerOptions): EventConsumer {
  return new EventConsumer(options);
}

/**
 * Base Event Handler class
 */
export abstract class BaseEventHandler<T = any> implements EventHandler<T> {
  constructor(protected eventType: string) {}

  abstract handle(message: QueueMessage<T>): Promise<void>;

  protected log(message: string, data?: any): void {
    console.log(`[${this.eventType}] ${message}`, data || '');
  }

  protected error(message: string, error?: any): void {
    console.error(`[${this.eventType}] ${message}`, error || '');
  }
}
