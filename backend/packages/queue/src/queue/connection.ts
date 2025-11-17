/**
 * RabbitMQ Connection Manager - Singleton Pattern
 *
 * Manages a single connection to RabbitMQ with automatic reconnection
 */

import amqp, { Connection, Channel } from 'amqplib';

export class QueueConnection {
  private static instance: QueueConnection | null = null;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000;

  private constructor(private url: string) {}

  /**
   * Get singleton instance
   */
  public static getInstance(url?: string): QueueConnection {
    if (!QueueConnection.instance) {
      const queueUrl = url || process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      QueueConnection.instance = new QueueConnection(queueUrl);
    }
    return QueueConnection.instance;
  }

  /**
   * Connect to RabbitMQ
   */
  public async connect(): Promise<void> {
    if (this.isConnected && this.connection) {
      return;
    }

    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (error) => {
        console.error('RabbitMQ connection error:', error);
        this.isConnected = false;
        this.reconnect();
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.isConnected = false;
        this.reconnect();
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✓ RabbitMQ connected successfully');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.reconnect();
    }
  }

  /**
   * Reconnect to RabbitMQ
   */
  private async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  /**
   * Get channel
   */
  public getChannel(): Channel {
    if (!this.channel || !this.isConnected) {
      throw new Error('RabbitMQ is not connected');
    }
    return this.channel;
  }

  /**
   * Get connection
   */
  public getConnection(): Connection {
    if (!this.connection || !this.isConnected) {
      throw new Error('RabbitMQ is not connected');
    }
    return this.connection;
  }

  /**
   * Check if connected
   */
  public isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.channel) return false;
      await this.channel.checkQueue('health-check');
      return true;
    } catch {
      return this.isConnected;
    }
  }

  /**
   * Close connection
   */
  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
    console.log('✓ RabbitMQ connection closed');
  }
}

/**
 * Get queue connection instance
 */
export function getQueueConnection(): QueueConnection {
  return QueueConnection.getInstance();
}
