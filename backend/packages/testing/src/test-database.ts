/**
 * Test Database Utilities
 * Singleton Pattern: Single database connection for tests
 */

/**
 * Test database manager - Singleton Pattern
 */
export class TestDatabaseManager {
  private static instance: TestDatabaseManager;
  private connectionString: string;

  private constructor() {
    this.connectionString =
      process.env.TEST_DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ecomify_test';
  }

  static getInstance(): TestDatabaseManager {
    if (!TestDatabaseManager.instance) {
      TestDatabaseManager.instance = new TestDatabaseManager();
    }
    return TestDatabaseManager.instance;
  }

  getConnectionString(): string {
    return this.connectionString;
  }

  /**
   * Clean all tables for testing
   */
  async cleanDatabase(prisma: any): Promise<void> {
    const tableNames = await this.getTableNames(prisma);

    for (const tableName of tableNames) {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`
        );
      } catch (error) {
        console.error(`Failed to truncate table ${tableName}:`, error);
      }
    }
  }

  private async getTableNames(prisma: any): Promise<string[]> {
    const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;
    return result.map((row) => row.tablename);
  }

  /**
   * Seed test data
   */
  async seedTestData(prisma: any, data: any): Promise<void> {
    // Implementation depends on specific data structure
    // This is a placeholder for seeding logic
  }
}

/**
 * Get test database instance
 */
export function getTestDatabase(): TestDatabaseManager {
  return TestDatabaseManager.getInstance();
}
