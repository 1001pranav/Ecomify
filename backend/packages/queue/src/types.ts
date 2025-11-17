/**
 * Message Queue types
 */

export interface QueueMessage<T = any> {
  id: string;
  type: string;
  data: T;
  timestamp: Date;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface QueueOptions {
  exchange?: string;
  routingKey?: string;
  durable?: boolean;
  persistent?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ConsumerOptions {
  queue: string;
  exchange?: string;
  routingKey?: string;
  prefetch?: number;
  autoAck?: boolean;
}

export interface PublisherOptions {
  exchange: string;
  exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  durable?: boolean;
}

export interface EventHandler<T = any> {
  handle(message: QueueMessage<T>): Promise<void>;
}

export interface EventSubscriber {
  event: string;
  handler: EventHandler;
}
