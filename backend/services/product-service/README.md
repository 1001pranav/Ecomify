# Product Catalog Service

Microservice for managing products, categories, and collections in the Ecomify e-commerce platform.

## Features

- ✅ **Product Management** - CRUD operations for products with variants
- ✅ **Search** - Full-text search with Elasticsearch (filters, facets, auto-complete)
- ✅ **Categories** - Hierarchical category structure
- ✅ **Collections** - Manual and automated product collections
- ✅ **Bulk Operations** - Bulk update, delete, CSV import/export
- ✅ **Event Publishing** - Publishes domain events for loose coupling

## Design Patterns

This service implements the following design patterns as per Sprint 3 requirements:

### 1. Repository Pattern
- **Location**: `src/database/base.repository.ts`, `src/products/product.repository.ts`
- **Purpose**: Abstracts data access logic from business logic
- **Example**: ProductRepository provides methods like `findByHandle()`, `bulkUpdate()`

### 2. Builder Pattern
- **Location**: `src/products/product.builder.ts`
- **Purpose**: Constructs complex Product objects with variants step-by-step
- **Example**:
```typescript
const builder = new ProductBuilder(storeId, "T-Shirt")
  .setDescription("Cotton t-shirt")
  .addOption("Size", ["S", "M", "L"])
  .addOption("Color", ["Red", "Blue"])
  .generateVariantsFromOptions(29.99)
  .build();
```

### 3. Factory Pattern
- **Location**: `src/products/product.builder.ts` (ProductBuilderFactory)
- **Purpose**: Creates ProductBuilder instances for different scenarios
- **Example**: `ProductBuilderFactory.createFromCSV()`, `createSimpleProduct()`

### 4. Strategy Pattern
- **Location**: `src/search/elasticsearch.service.ts`, `src/collections/collection.service.ts`
- **Purpose**: Encapsulates search algorithms and condition evaluation
- **Example**: ElasticsearchService can be swapped with other search providers

### 5. Command Pattern
- **Location**: `src/products/commands/`
- **Purpose**: Encapsulates bulk operations as command objects
- **Example**: `CSVImportCommand`, `CSVExportCommand`

### 6. Observer Pattern
- **Location**: `src/events/event-publisher.service.ts`
- **Purpose**: Publishes domain events for other services to react
- **Example**: `publishProductCreated()`, `publishProductUpdated()`

### 7. Singleton Pattern
- **Location**: `src/database/prisma.service.ts`
- **Purpose**: Single database connection instance
- **Example**: PrismaService maintains one connection pool

## Architecture

### Service Independence
- **No direct dependencies** on other services
- Communicates via events (RabbitMQ) and HTTP APIs
- Can function standalone without Order, Customer, or Payment services
- Uses `storeId` reference instead of importing Store service

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Search**: Elasticsearch
- **Message Queue**: RabbitMQ
- **CSV Processing**: csv-parse, csv-stringify

## API Endpoints

### Products

```bash
# Create product
POST /api/v1/products

# Get products
GET /api/v1/products?storeId=xxx&status=ACTIVE&page=1&limit=20

# Get product by ID
GET /api/v1/products/:id

# Get product by handle
GET /api/v1/products/handle/:storeId/:handle

# Update product
PATCH /api/v1/products/:id

# Delete product
DELETE /api/v1/products/:id

# Bulk operations
POST /api/v1/products/bulk/update
POST /api/v1/products/bulk/delete
POST /api/v1/products/bulk/import
GET /api/v1/products/bulk/export?storeId=xxx
GET /api/v1/products/bulk/template
```

### Search

```bash
# Search products
GET /api/v1/products/search?storeId=xxx&q=shirt&priceMin=10&priceMax=100&tags=summer
```

### Categories

```bash
# Create category
POST /api/v1/categories

# Get categories
GET /api/v1/categories?storeId=xxx

# Get category tree
GET /api/v1/categories/tree?storeId=xxx

# Get category by ID
GET /api/v1/categories/:id

# Update category
PATCH /api/v1/categories/:id

# Delete category
DELETE /api/v1/categories/:id

# Add product to category
POST /api/v1/categories/:categoryId/products/:productId
```

### Collections

```bash
# Create collection
POST /api/v1/collections

# Get collections
GET /api/v1/collections?storeId=xxx&type=MANUAL

# Get collection by ID
GET /api/v1/collections/:id

# Update collection
PATCH /api/v1/collections/:id

# Delete collection
DELETE /api/v1/collections/:id

# Add product to manual collection
POST /api/v1/collections/:collectionId/products/:productId

# Refresh automated collection
POST /api/v1/collections/:id/refresh
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3003
DATABASE_URL=postgresql://user:pass@localhost:5432/ecomify_product
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
ELASTICSEARCH_NODE=http://localhost:9200
```

### 3. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Service

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Events Published

- `product.created` - When a product is created
- `product.updated` - When a product is updated
- `product.deleted` - When a product is deleted
- `product.published` - When a product status changes to ACTIVE
- `product.archived` - When a product is archived
- `category.created` - When a category is created
- `category.updated` - When a category is updated
- `category.deleted` - When a category is deleted
- `collection.created` - When a collection is created
- `collection.updated` - When a collection is updated
- `collection.deleted` - When a collection is deleted

## Service Health

```bash
# Health check (if implemented)
GET /health
```

## Development Notes

- All products must have at least one variant
- Handles are auto-generated from titles (URL-friendly)
- Automated collections update when conditions change
- CSV import supports create and update operations
- Search indexing happens automatically on product changes
- Multi-tenancy enforced via `storeId` field

## Future Enhancements

- [ ] Product reviews and ratings
- [ ] Product recommendations
- [ ] Advanced inventory tracking
- [ ] Product bundles
- [ ] Digital products support
- [ ] Variants with images
- [ ] Product comparison
