/**
 * Test Helpers - Strategy Pattern for different test scenarios
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

/**
 * Interface for test setup strategy
 * Strategy Pattern: Different strategies for setting up test applications
 */
export interface TestSetupStrategy {
  setupApplication(app: INestApplication): Promise<void>;
}

/**
 * Default test setup strategy
 */
export class DefaultTestSetup implements TestSetupStrategy {
  async setupApplication(app: INestApplication): Promise<void> {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
  }
}

/**
 * Test Application Builder - Builder Pattern
 * Provides a fluent interface for creating test applications
 */
export class TestApplicationBuilder {
  private module: any;
  private setupStrategy: TestSetupStrategy = new DefaultTestSetup();
  private globalPipes: any[] = [];
  private globalGuards: any[] = [];
  private globalInterceptors: any[] = [];

  constructor(module: any) {
    this.module = module;
  }

  withSetupStrategy(strategy: TestSetupStrategy): this {
    this.setupStrategy = strategy;
    return this;
  }

  withGlobalPipe(pipe: any): this {
    this.globalPipes.push(pipe);
    return this;
  }

  withGlobalGuard(guard: any): this {
    this.globalGuards.push(guard);
    return this;
  }

  withGlobalInterceptor(interceptor: any): this {
    this.globalInterceptors.push(interceptor);
    return this;
  }

  async build(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [this.module],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Apply setup strategy
    await this.setupStrategy.setupApplication(app);

    // Apply global pipes
    this.globalPipes.forEach((pipe) => app.useGlobalPipes(pipe));

    // Apply global guards
    this.globalGuards.forEach((guard) => app.useGlobalGuards(guard));

    // Apply global interceptors
    this.globalInterceptors.forEach((interceptor) =>
      app.useGlobalInterceptors(interceptor)
    );

    await app.init();
    return app;
  }
}

/**
 * Create JWT token for testing
 */
export function createTestJWT(payload: any): string {
  // In a real scenario, this would use the actual JWT service
  // For testing, we'll create a mock token
  return `test.${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`;
}

/**
 * Sleep utility for testing async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random test data
 */
export const TestDataGenerator = {
  randomEmail: () => `test-${Date.now()}-${Math.random()}@example.com`,
  randomString: (length: number = 10) =>
    Math.random().toString(36).substring(2, 2 + length),
  randomNumber: (min: number = 0, max: number = 1000) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  randomBoolean: () => Math.random() >= 0.5,
};
