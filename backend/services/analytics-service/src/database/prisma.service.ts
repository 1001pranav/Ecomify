import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Singleton Pattern: Ensures single database connection instance
 * Repository Pattern: Provides data access abstraction
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('📊 Analytics Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📊 Analytics Database disconnected');
  }
}
