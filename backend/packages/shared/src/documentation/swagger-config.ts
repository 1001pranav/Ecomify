/**
 * Swagger/OpenAPI Configuration
 * Provides API documentation setup for all services
 */

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger configuration builder - Builder Pattern
 */
export class SwaggerConfigBuilder {
  private title: string = 'API Documentation';
  private description: string = 'API documentation for microservice';
  private version: string = '1.0';
  private tags: string[] = [];
  private servers: Array<{ url: string; description: string }> = [];

  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setVersion(version: string): this {
    this.version = version;
    return this;
  }

  addTag(tag: string): this {
    this.tags.push(tag);
    return this;
  }

  addServer(url: string, description: string): this {
    this.servers.push({ url, description });
    return this;
  }

  build() {
    const builder = new DocumentBuilder()
      .setTitle(this.title)
      .setDescription(this.description)
      .setVersion(this.version)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for external integrations',
        },
        'api-key'
      );

    this.tags.forEach((tag) => builder.addTag(tag));
    this.servers.forEach((server) => builder.addServer(server.url, server.description));

    return builder.build();
  }
}

/**
 * Setup Swagger documentation for a service
 */
export function setupSwagger(
  app: INestApplication,
  config: {
    title: string;
    description: string;
    version?: string;
    path?: string;
    tags?: string[];
  }
): void {
  const configBuilder = new SwaggerConfigBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version || '1.0')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.ecomify.com', 'Production');

  config.tags?.forEach((tag) => configBuilder.addTag(tag));

  const swaggerConfig = configBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(config.path || 'api/docs', app, document, {
    customSiteTitle: config.title,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
}

/**
 * Service-specific Swagger configurations
 */
export const SwaggerConfigs = {
  authService: {
    title: 'Authentication Service API',
    description: 'API for user authentication and authorization',
    tags: ['Authentication', 'Users', 'Sessions', 'MFA'],
  },

  storeService: {
    title: 'Store Management Service API',
    description: 'API for managing stores and their configurations',
    tags: ['Stores', 'Themes', 'Settings'],
  },

  productService: {
    title: 'Product Catalog Service API',
    description: 'API for managing products, variants, and categories',
    tags: ['Products', 'Variants', 'Categories', 'Collections', 'Search'],
  },

  orderService: {
    title: 'Order Management Service API',
    description: 'API for managing orders and fulfillments',
    tags: ['Orders', 'Fulfillments', 'Refunds'],
  },

  paymentService: {
    title: 'Payment Service API',
    description: 'API for processing payments and transactions',
    tags: ['Payments', 'Transactions', 'Refunds'],
  },

  inventoryService: {
    title: 'Inventory Service API',
    description: 'API for managing product inventory',
    tags: ['Inventory', 'Locations', 'Stock Levels'],
  },

  customerService: {
    title: 'Customer Service API',
    description: 'API for managing customer data',
    tags: ['Customers', 'Addresses', 'Segments'],
  },

  analyticsService: {
    title: 'Analytics Service API',
    description: 'API for retrieving analytics and reports',
    tags: ['Analytics', 'Reports', 'Metrics'],
  },

  notificationService: {
    title: 'Notification Service API',
    description: 'API for managing notifications',
    tags: ['Notifications', 'Templates'],
  },

  emailService: {
    title: 'Email Service API',
    description: 'API for sending emails',
    tags: ['Emails', 'Templates'],
  },

  pluginService: {
    title: 'Plugin Service API',
    description: 'API for managing plugins and webhooks',
    tags: ['Plugins', 'Webhooks', 'Installations'],
  },

  apiGateway: {
    title: 'Ecomify API Gateway',
    description: 'Unified API Gateway for all Ecomify services',
    tags: [
      'Authentication',
      'Stores',
      'Products',
      'Orders',
      'Payments',
      'Inventory',
      'Customers',
      'Analytics',
      'Notifications',
      'Emails',
      'Plugins',
    ],
  },
};

/**
 * API Examples for documentation
 */
export const ApiExamples = {
  user: {
    register: {
      email: 'user@example.com',
      password: 'SecurePassword123!',
      firstName: 'John',
      lastName: 'Doe',
    },
    login: {
      email: 'user@example.com',
      password: 'SecurePassword123!',
    },
  },

  store: {
    create: {
      name: 'My Awesome Store',
      email: 'store@example.com',
      currency: 'USD',
      locale: 'en-US',
      timezone: 'America/New_York',
    },
  },

  product: {
    create: {
      title: 'Premium T-Shirt',
      description: 'High-quality cotton t-shirt',
      productType: 'Apparel',
      vendor: 'Brand Name',
      tags: ['clothing', 't-shirt'],
      variants: [
        {
          title: 'Small / Red',
          price: 29.99,
          sku: 'TS-S-RED',
          inventoryQty: 100,
          options: { size: 'S', color: 'Red' },
        },
      ],
    },
  },

  order: {
    create: {
      storeId: 'store_123',
      email: 'customer@example.com',
      lineItems: [
        {
          variantId: 'variant_123',
          quantity: 2,
        },
      ],
      shippingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        province: 'NY',
        country: 'US',
        zip: '10001',
        phone: '+1234567890',
      },
      billingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        province: 'NY',
        country: 'US',
        zip: '10001',
        phone: '+1234567890',
      },
      shippingRate: 10.0,
    },
  },
};
