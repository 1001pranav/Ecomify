/**
 * Redis Cache Client - Singleton Pattern
 *
 * This implements the Singleton design pattern for Redis connection
 * to ensure efficient resource usage and connection pooling.
 */

import Redis, { RedisOptions } from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

/**
 * Redis Client implementing Singleton pattern
 */
class RedisClient {
  private static instance: RedisClient | null = null;
  private client: Redis;
  private subscriber: Redis;
  private isConnected: boolean = false;

  private constructor(config?: RedisOptions) {
    const defaultConfig: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    this.client = new Redis({ ...defaultConfig, ...config });
    this.subscriber = new Redis({ ...defaultConfig, ...config });

    this.setupEventHandlers();
  }

  /**
   * Get the singleton instance of RedisClient
   * @param config Optional Redis configuration
   * @returns RedisClient instance
   */
  public static getInstance(config?: RedisOptions): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient(config);
    }
    return RedisClient.instance;
  }

  /**
   * Setup event handlers for Redis client
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('✓ Redis connected');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });

    this.client.on('close', () => {
      console.log('Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
    });
  }

  /**
   * Get Redis client instance
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Get Redis subscriber instance
   */
  public getSubscriber(): Redis {
    return this.subscriber;
  }

  /**
   * Set a value in cache
   */
  public async set(
    key: string,
    value: any,
    options?: CacheOptions,
  ): Promise<void> {
    const serialized = JSON.stringify(value);
    const prefixedKey = options?.prefix ? `${options.prefix}:${key}` : key;

    if (options?.ttl) {
      await this.client.setex(prefixedKey, options.ttl, serialized);
    } else {
      await this.client.set(prefixedKey, serialized);
    }
  }

  /**
   * Get a value from cache
   */
  public async get<T = any>(key: string, prefix?: string): Promise<T | null> {
    const prefixedKey = prefix ? `${prefix}:${key}` : key;
    const value = await this.client.get(prefixedKey);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * Delete a key from cache
   */
  public async del(key: string, prefix?: string): Promise<void> {
    const prefixedKey = prefix ? `${prefix}:${key}` : key;
    await this.client.del(prefixedKey);
  }

  /**
   * Delete multiple keys matching a pattern
   */
  public async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Check if a key exists
   */
  public async exists(key: string, prefix?: string): Promise<boolean> {
    const prefixedKey = prefix ? `${prefix}:${key}` : key;
    const result = await this.client.exists(prefixedKey);
    return result === 1;
  }

  /**
   * Set expiry time for a key
   */
  public async expire(key: string, ttl: number, prefix?: string): Promise<void> {
    const prefixedKey = prefix ? `${prefix}:${key}` : key;
    await this.client.expire(prefixedKey, ttl);
  }

  /**
   * Increment a value
   */
  public async incr(key: string, prefix?: string): Promise<number> {
    const prefixedKey = prefix ? `${prefix}:${key}` : key;
    return await this.client.incr(prefixedKey);
  }

  /**
   * Decrement a value
   */
  public async decr(key: string, prefix?: string): Promise<number> {
    const prefixedKey = prefix ? `${prefix}:${key}` : key;
    return await this.client.decr(prefixedKey);
  }

  /**
   * Publish a message to a channel
   */
  public async publish(channel: string, message: any): Promise<void> {
    const serialized = JSON.stringify(message);
    await this.client.publish(channel, serialized);
  }

  /**
   * Subscribe to a channel
   */
  public async subscribe(
    channel: string,
    handler: (message: any) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(msg);
          handler(parsed);
        } catch {
          handler(msg);
        }
      }
    });
  }

  /**
   * Unsubscribe from a channel
   */
  public async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    await this.client.quit();
    await this.subscriber.quit();
    this.isConnected = false;
    console.log('✓ Redis disconnected');
  }

  /**
   * Check if Redis is connected
   */
  public isConnectionActive(): boolean {
    return this.isConnected;
  }
}

/**
 * Get Redis instance (Singleton)
 */
export function getRedis(): RedisClient {
  return RedisClient.getInstance();
}

/**
 * Export the singleton instance
 */
export const redis = RedisClient.getInstance();
