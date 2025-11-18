/**
 * Load Testing with k6
 * Tests system performance under load
 *
 * Run with: k6 run test/load/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users
    { duration: '5m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200'], // 95% of requests should be below 200ms
    'http_req_failed': ['rate<0.01'], // Error rate should be below 1%
    'errors': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_GATEWAY_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'Password123!' },
  { email: 'test2@example.com', password: 'Password123!' },
  { email: 'test3@example.com', password: 'Password123!' },
];

/**
 * Setup function - runs once at the start
 */
export function setup() {
  console.log('Starting load test...');
  return { timestamp: Date.now() };
}

/**
 * Main test function
 */
export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  // Test 1: Health check
  testHealthCheck();

  // Test 2: User authentication
  const authToken = testAuthentication(user);

  // Test 3: Store operations
  if (authToken) {
    testStoreOperations(authToken);
  }

  // Test 4: Product search
  testProductSearch();

  // Test 5: Order creation
  if (authToken) {
    testOrderCreation(authToken);
  }

  sleep(1);
}

function testHealthCheck() {
  const res = http.get(`${BASE_URL}/health`);
  const success = check(res, {
    'health check status is 200': (r) => r.status === 200,
  });
  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

function testAuthentication(user) {
  const payload = JSON.stringify(user);
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, params);
  const success = check(res, {
    'login status is 200': (r) => r.status === 200,
    'login returns access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.accessToken !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);

  try {
    const body = JSON.parse(res.body);
    return body.accessToken;
  } catch {
    return null;
  }
}

function testStoreOperations(authToken) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  };

  // Get stores
  const res = http.get(`${BASE_URL}/api/v1/stores`, params);
  const success = check(res, {
    'get stores status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

function testProductSearch() {
  const searchQuery = ['shirt', 'pants', 'shoes'][Math.floor(Math.random() * 3)];
  const res = http.get(`${BASE_URL}/api/v1/products/search?q=${searchQuery}`);

  const success = check(res, {
    'product search status is 200': (r) => r.status === 200,
    'product search response time < 100ms': (r) => r.timings.duration < 100,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

function testOrderCreation(authToken) {
  const orderData = {
    storeId: 'test-store-id',
    email: 'customer@example.com',
    lineItems: [
      {
        variantId: 'test-variant-id',
        quantity: 1,
      },
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      province: 'NY',
      country: 'US',
      zip: '10001',
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      province: 'NY',
      country: 'US',
      zip: '10001',
    },
    shippingRate: 10.0,
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  };

  const res = http.post(
    `${BASE_URL}/api/v1/orders`,
    JSON.stringify(orderData),
    params
  );

  const success = check(res, {
    'order creation status is 201 or 400 or 401': (r) =>
      r.status === 201 || r.status === 400 || r.status === 401,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

/**
 * Teardown function - runs once at the end
 */
export function teardown(data) {
  console.log('Load test completed.');
  console.log(`Started at: ${new Date(data.timestamp).toISOString()}`);
  console.log(`Ended at: ${new Date().toISOString()}`);
}
