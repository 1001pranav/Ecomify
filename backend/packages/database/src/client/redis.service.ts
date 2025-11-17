/**
 * Redis Service - Service wrapper for Redis client
 */

import { Injectable } from '@nestjs/common';
import { getRedis } from './redis';

export interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

@Injectable()
export class RedisService {
  private redis = getRedis();

  constructor(config?: RedisConfig) {
    // Config is applied through environment variables
  }

  async connect(): Promise<void> {
    // Connection is handled by singleton
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(key, value, { ttl: ttlSeconds });
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    return this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.redis.exists(key);
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.redis.decr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    return this.redis.expire(key, ttlSeconds);
  }

  async healthCheck(): Promise<boolean> {
    return this.redis.healthCheck();
  }

  async disconnect(): Promise<void> {
    return this.redis.disconnect();
  }
}
