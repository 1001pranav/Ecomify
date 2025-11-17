/**
 * Prisma Service - Singleton Pattern
 * Manages database connection lifecycle
 */

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';

// Temporary mock for Prisma Client until generation
const PrismaClient = class {
  async $connect() {}
  async $disconnect() {}
  async $executeRawUnsafe(...args: any[]) {}
  async $transaction(callback: any) {
    return callback(this);
  }
  store = {
    create: async (...args: any[]) => ({}),
    findUnique: async (...args: any[]) => null,
    findMany: async (...args: any[]) => [],
    update: async (...args: any[]) => ({}),
    count: async (...args: any[]) => 0,
  };
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Set Row-Level Security context for multi-tenancy
   * @param storeId - Store ID for RLS context
   */
  async setRLSContext(storeId: string): Promise<void> {
    // Set PostgreSQL session variable for RLS
    await this.$executeRawUnsafe(
      `SET LOCAL app.current_store_id = '${storeId}'`
    );
  }

  /**
   * Execute within a transaction with RLS context
   */
  async withRLSContext<T>(
    storeId: string,
    callback: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await (tx as any).$executeRawUnsafe(
        `SET LOCAL app.current_store_id = '${storeId}'`
      );
      return callback(tx as PrismaClient);
    });
  }
}
