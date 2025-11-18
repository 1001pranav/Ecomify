import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Singleton Pattern: Database Connection
 * Ensures single database connection instance across the application
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Inventory Service Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Inventory Service Database disconnected');
  }
}
