/**
 * Cache Service - Decorator Pattern for caching
 * Implements caching strategy for performance optimization
 */

import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Cache strategy interface - Strategy Pattern
 */
export interface CacheStrategy {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Redis cache strategy implementation
 */
@Injectable()
export class RedisCacheStrategy implements CacheStrategy {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.client.setex(key, ttl, value);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return await this.client.mget(...keys);
  }

  async mset(entries: Record<string, string>, ttl: number = 3600): Promise<void> {
    const pipeline = this.client.pipeline();
    Object.entries(entries).forEach(([key, value]) => {
      pipeline.setex(key, ttl, value);
    });
    await pipeline.exec();
  }

  getClient(): Redis {
    return this.client;
  }
}

/**
 * Cache decorator factory - Decorator Pattern
 * Used to cache method results
 */
export function Cacheable(options: {
  ttl?: number;
  keyGenerator?: (...args: any[]) => string;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const ttl = options.ttl || 3600;

    descriptor.value = async function (...args: any[]) {
      const cache: RedisCacheStrategy = this.cacheService;
      if (!cache) {
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const cacheKey = options.keyGenerator
        ? options.keyGenerator(...args)
        : `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Execute method and cache result
      const result = await originalMethod.apply(this, args);
      await cache.set(cacheKey, JSON.stringify(result), ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 */
export function CacheInvalidate(options: {
  keyPattern?: string;
  keyGenerator?: (...args: any[]) => string;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      const cache: RedisCacheStrategy = this.cacheService;
      if (cache) {
        const keyToInvalidate = options.keyGenerator
          ? options.keyGenerator(...args)
          : options.keyPattern || '';
        await cache.delete(keyToInvalidate);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache service with multiple strategies
 */
@Injectable()
export class CacheService {
  private strategy: CacheStrategy;

  constructor() {
    this.strategy = new RedisCacheStrategy();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.strategy.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.strategy.set(key, JSON.stringify(value), ttl);
  }

  async delete(key: string): Promise<void> {
    await this.strategy.delete(key);
  }

  async clear(): Promise<void> {
    await this.strategy.clear();
  }

  /**
   * Get or set cache with factory function
   * Template Method Pattern
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
