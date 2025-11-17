/**
 * Database Module
 *
 * Provides database and Redis connections
 */

import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getDatabase } from '@ecomify/database';
import { RedisService } from '@ecomify/database';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const db = getDatabase();
        await db.connect();
        return db;
      },
    },
    {
      provide: RedisService,
      useFactory: async () => {
        const redis = new RedisService({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        });
        await redis.connect();
        return redis;
      },
    },
  ],
  exports: ['DATABASE_CONNECTION', RedisService],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('✓ Database module initialized');
  }

  async onModuleDestroy() {
    const db = getDatabase();
    await db.disconnect();
    console.log('✓ Database disconnected');
  }
}
