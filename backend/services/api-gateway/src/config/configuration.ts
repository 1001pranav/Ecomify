/**
 * API Gateway Configuration
 */

export default () => ({
  port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    ttl: 60000, // 1 minute
    limit: parseInt(process.env.RATE_LIMIT || '100', 10),
  },

  // Services URLs
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    store: process.env.STORE_SERVICE_URL || 'http://localhost:3002',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
    inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3006',
    customer: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3007',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3008',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },

  // GraphQL Configuration
  graphql: {
    playground: process.env.NODE_ENV !== 'production',
    introspection: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV === 'development',
  },
});
