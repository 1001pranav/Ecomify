# Order Management Service

A comprehensive order management microservice built with NestJS, implementing multiple design patterns for maintainability and scalability.

## 🎯 Features

- **Complete Order Lifecycle Management**
  - Order creation with automatic number generation
  - Order status tracking and transitions
  - Order fulfillment management
  - Order cancellation and refunds
  - Advanced search and filtering

- **Design Patterns Implemented**
  - **Factory Pattern**: Order number generation
  - **Builder Pattern**: Complex order construction with validation
  - **Repository Pattern**: Data access abstraction
  - **Saga Pattern**: Distributed transaction management
  - **State Pattern**: Order status workflow with validation
  - **Observer Pattern**: Event-driven architecture

## 🏗️ Architecture

```
order-service/
├── src/
│   ├── database/           # Database layer (Singleton pattern)
│   │   ├── prisma.service.ts
│   │   ├── base.repository.ts
│   │   └── database.module.ts
│   ├── events/             # Observer Pattern
│   │   ├── event-publisher.service.ts
│   │   └── events.module.ts
│   ├── orders/
│   │   ├── patterns/       # Design Patterns
│   │   │   ├── order-number.factory.ts      # Factory Pattern
│   │   │   └── order.builder.ts             # Builder Pattern
│   │   ├── saga/           # Saga Pattern
│   │   │   └── saga-orchestrator.service.ts
│   │   ├── state/          # State Pattern
│   │   │   ├── order-state.interface.ts
│   │   │   └── order-state-machine.service.ts
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── order.repository.ts              # Repository Pattern
│   │   ├── orders.service.ts
│   │   ├── orders.controller.ts
│   │   └── orders.module.ts
│   ├── fulfillment/
│   │   ├── dto/
│   │   ├── fulfillment.repository.ts
│   │   ├── fulfillment.service.ts
│   │   ├── fulfillment.controller.ts
│   │   └── fulfillment.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/                   # Unit & Integration tests
├── prisma/                 # Database schema
└── package.json
```

## 🚀 Design Patterns

### 1. Factory Pattern - Order Number Generator
Generates unique order numbers with consistent format.

```typescript
// Usage
const orderNumber = orderNumberFactory.generate();
// Output: ORD-20231215-A3F9K2
```

### 2. Builder Pattern - Order Construction
Provides fluent interface for building complex orders with validation.

```typescript
const order = orderBuilder
  .reset()
  .setOrderNumber('ORD-20231215-A3F9K2')
  .setStoreId('store1')
  .setEmail('customer@example.com')
  .addLineItem({ variantId: 'var1', quantity: 2, price: 50 })
  .setShippingAddress(address)
  .build();
```

### 3. Repository Pattern - Data Access
Abstracts database operations from business logic.

```typescript
const order = await orderRepository.findById(orderId);
await orderRepository.update(orderId, data);
```

### 4. Saga Pattern - Distributed Transactions
Manages complex workflows across multiple services with compensation logic.

```typescript
// Order Creation Saga Steps:
1. Create order (Pending)
2. Reserve inventory → Rollback if fails
3. Calculate shipping → Rollback if fails
4. Calculate tax → Rollback if fails
5. Create payment intent → Rollback if fails
6. Update order status → Confirmed
```

### 5. State Pattern - Order Status Workflow
Enforces valid state transitions and business rules.

```typescript
// Valid transitions enforced by State Machine
PENDING → AUTHORIZED → PAID → REFUNDED
UNFULFILLED → PARTIALLY_FULFILLED → FULFILLED
```

### 6. Observer Pattern - Event Publishing
Publishes domain events for loose coupling between services.

```typescript
// Events published:
- order.created
- order.status_changed
- order.fulfilled
- order.cancelled
- order.refunded
```

## 📊 Database Schema

**Models:**
- Order
- OrderLineItem
- Fulfillment
- OrderStatusHistory (audit trail)
- Refund
- SagaExecution (for distributed transactions)

**Enums:**
- FinancialStatus: PENDING, AUTHORIZED, PAID, PARTIALLY_REFUNDED, REFUNDED, VOIDED
- FulfillmentStatus: UNFULFILLED, PARTIALLY_FULFILLED, FULFILLED

## 🔌 API Endpoints

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Search/filter orders
- `GET /api/v1/orders/:id` - Get order by ID
- `GET /api/v1/orders/number/:orderNumber` - Get order by number
- `PATCH /api/v1/orders/:id/status` - Update order status
- `GET /api/v1/orders/:id/transitions` - Get valid state transitions
- `POST /api/v1/orders/:id/cancel` - Cancel order
- `POST /api/v1/orders/:id/refunds` - Create refund

### Fulfillment
- `POST /api/v1/orders/:orderId/fulfillments` - Create fulfillment
- `GET /api/v1/orders/:orderId/fulfillments` - Get fulfillments

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

**Test Coverage:**
- Service logic (Factory, Builder, Repository patterns)
- State machine (State Pattern)
- Saga orchestration (Saga Pattern)
- Event publishing (Observer Pattern)

## 🔧 Configuration

Environment variables:
```env
PORT=3004
DATABASE_URL=postgresql://user:password@localhost:5432/ecomify_orders
API_PREFIX=/api/v1
CORS_ORIGIN=*
```

## 🚢 Deployment

```bash
# Build Docker image
docker build -t ecomify-order-service .

# Run container
docker run -p 3004:3004 \
  -e DATABASE_URL=postgresql://... \
  ecomify-order-service
```

## 📈 Service Independence

The Order Service is designed to function independently:
- Does NOT import code from other services
- Communicates via events and APIs only
- Can operate in degraded mode if other services are down
- Implements Circuit Breaker pattern (via Saga)

## 🔒 Security

- Input validation using class-validator
- SQL injection prevention via Prisma ORM
- State transition validation prevents invalid operations
- Audit trail via OrderStatusHistory

## 📝 Business Rules

1. Orders must have at least one line item
2. Status transitions follow State Machine rules
3. Cancellation allowed only for non-refunded orders
4. Refunds cannot exceed order total
5. Fulfillment requires payment authorization
6. All state changes are audited

## 🎓 Learning Resources

This service demonstrates:
- Microservices architecture
- Domain-driven design (DDD)
- Event-driven architecture
- SOLID principles
- Design pattern implementation
- Test-driven development (TDD)

## 📄 License

MIT

## 👥 Contributing

1. Follow existing design patterns
2. Write tests for all new features
3. Update documentation
4. Ensure all tests pass
