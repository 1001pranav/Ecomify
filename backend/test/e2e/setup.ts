/**
 * E2E Test Setup
 * Initializes test environment and cleans up after tests
 */

import { execSync } from 'child_process';

beforeAll(async () => {
  console.log('Setting up E2E test environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ecomify_test';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  process.env.RABBITMQ_URL = 'amqp://localhost:5672';

  // Run database migrations
  try {
    execSync('cd ../packages/database && npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    });
  } catch (error) {
    console.error('Failed to run migrations:', error);
  }
});

afterAll(async () => {
  console.log('Cleaning up E2E test environment...');
  // Cleanup can be added here if needed
});
