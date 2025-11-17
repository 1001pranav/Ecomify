/**
 * Prisma Database Client - Singleton Pattern
 *
 * This implements the Singleton design pattern to ensure only one instance
 * of the Prisma Client exists throughout the application lifecycle.
 * This prevents connection pool exhaustion and ensures efficient resource usage.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Extended Prisma Client with custom methods and middleware
 */
class DatabaseClient extends PrismaClient {
  private static instance: DatabaseClient | null = null;
  private static isConnected: boolean = false;

  private constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
      errorFormat: 'pretty',
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Get the singleton instance of DatabaseClient
   * @returns DatabaseClient instance
   */
  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  /**
   * Setup Prisma middleware for logging and transformations
   */
  private setupMiddleware(): void {
    // Soft delete middleware (if needed)
    this.$use(async (params, next) => {
      // Log query execution time
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      if (process.env.LOG_LEVEL === 'debug') {
        console.log(
          `Query ${params.model}.${params.action} took ${after - before}ms`,
        );
      }

      return result;
    });
  }

  /**
   * Setup event handlers for Prisma Client
   */
  private setupEventHandlers(): void {
    this.$on('query' as never, (e: any) => {
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('Query:', e.query);
        console.log('Params:', e.params);
        console.log('Duration:', e.duration, 'ms');
      }
    });

    this.$on('error' as never, (e: any) => {
      console.error('Prisma Error:', e);
    });

    this.$on('warn' as never, (e: any) => {
      console.warn('Prisma Warning:', e);
    });
  }

  /**
   * Connect to database
   */
  public async connect(): Promise<void> {
    if (!DatabaseClient.isConnected) {
      await this.$connect();
      DatabaseClient.isConnected = true;
      console.log('✓ Database connected successfully');
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    if (DatabaseClient.isConnected) {
      await this.$disconnect();
      DatabaseClient.isConnected = false;
      console.log('✓ Database disconnected');
    }
  }

  /**
   * Check if database is connected
   */
  public isConnectionActive(): boolean {
    return DatabaseClient.isConnected;
  }

  /**
   * Health check - test database connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Execute a transaction with automatic rollback on error
   */
  public async executeTransaction<T>(
    fn: (tx: DatabaseClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      return fn(prisma as DatabaseClient);
    });
  }
}

/**
 * Get database instance (Singleton)
 */
export function getDatabase(): DatabaseClient {
  return DatabaseClient.getInstance();
}

/**
 * Export the singleton instance
 */
export const db = DatabaseClient.getInstance();

/**
 * Export Prisma types for use in services
 */
export type { PrismaClient };
export { Prisma } from '@prisma/client';
