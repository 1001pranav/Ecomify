# Ecomify - E-Commerce Platform Design Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Overview](#architecture-overview)
3. [Design Patterns](#design-patterns)
4. [Core Modules](#core-modules)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Multi-Country Support](#multi-country-support)
8. [Scalability Strategy](#scalability-strategy)
9. [Mobile Application](#mobile-application)
10. [Security Architecture](#security-architecture)
11. [Plugin/Extension System](#plugin-extension-system)
12. [Admin Customization](#admin-customization)

---

## 1. System Overview

### 1.1 Vision
Ecomify is a fully customizable, multi-tenant e-commerce platform enabling merchants to create, manage, and scale online stores with extensive admin-side customization capabilities, mobile applications, and multi-country support.

### 1.2 Key Features
- **Multi-tenant Architecture**: Support thousands of independent stores
- **Admin Customization**: Fully customizable admin dashboard, workflows, and settings
- **Mobile Apps**: Native iOS and Android applications for merchants and customers
- **Plugin System**: Extensible marketplace for third-party integrations
- **Multi-Country**: Support for multiple currencies, languages, tax systems, and payment gateways
- **Scalability**: Horizontal scaling to handle millions of products and orders
- **Headless Commerce**: API-first approach for omnichannel experiences

### 1.3 User Roles
- **Platform Admin**: Manages the entire platform
- **Merchant/Store Owner**: Manages their store
- **Store Staff**: Limited admin access
- **Customer**: Browses and purchases products
- **Plugin Developer**: Builds extensions

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN (Cloudflare)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (NGINX)                    │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Next.js    │  │  API Gateway │  │  Mobile API  │
    │  (Frontend)  │  │   (GraphQL)  │  │   (REST)     │
    └──────────────┘  └──────────────┘  └──────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Auth       │  │  Product     │  │   Order      │
    │  Service     │  │  Service     │  │  Service     │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                 │                 │
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Payment     │  │  Inventory   │  │  Analytics   │
    │  Service     │  │  Service     │  │  Service     │
    └──────────────┘  └──────────────┘  └──────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  PostgreSQL  │  │    Redis     │  │ Elasticsearch│
    │  (Primary)   │  │   (Cache)    │  │   (Search)   │
    └──────────────┘  └──────────────┘  └──────────────┘
```

### 2.2 Architectural Style
- **Microservices Architecture**: Domain-driven service separation
- **Event-Driven Architecture**: Asynchronous communication via message queues
- **CQRS Pattern**: Separate read and write operations for scalability
- **API Gateway Pattern**: Centralized entry point for all client requests

### 2.3 Technology Stack

#### Backend
- **Language**: TypeScript (Node.js)
- **Framework**: NestJS (for microservices)
- **API**: GraphQL (Apollo) + REST
- **ORM**: Prisma (with PostgreSQL)
- **Message Queue**: RabbitMQ / Apache Kafka
- **Caching**: Redis
- **Search**: Elasticsearch

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod

#### Mobile
- **Framework**: React Native (Expo)
- **State**: Redux Toolkit
- **API Client**: Axios + React Query

#### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Grafana + Prometheus
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Cloud**: AWS / GCP

---

## 3. Design Patterns

### 3.1 Creational Patterns

#### Factory Pattern
**Use Case**: Creating different types of payment processors, shipping providers, tax calculators

```typescript
// services/payment/PaymentProcessorFactory.ts
interface PaymentProcessor {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
}

class StripeProcessor implements PaymentProcessor { ... }
class PayPalProcessor implements PaymentProcessor { ... }
class RazorpayProcessor implements PaymentProcessor { ... }

class PaymentProcessorFactory {
  static create(type: PaymentType, country: string): PaymentProcessor {
    switch(type) {
      case 'stripe': return new StripeProcessor();
      case 'paypal': return new PayPalProcessor();
      case 'razorpay': return new RazorpayProcessor();
      default: throw new Error('Unsupported payment processor');
    }
  }
}
```

#### Builder Pattern
**Use Case**: Building complex order objects, customizable storefront themes

```typescript
// services/order/OrderBuilder.ts
class OrderBuilder {
  private order: Order;

  constructor(storeId: string, customerId: string) {
    this.order = new Order(storeId, customerId);
  }

  addLineItem(product: Product, quantity: number): this {
    this.order.lineItems.push(new LineItem(product, quantity));
    return this;
  }

  applyDiscount(discount: Discount): this {
    this.order.discounts.push(discount);
    return this;
  }

  setShippingAddress(address: Address): this {
    this.order.shippingAddress = address;
    return this;
  }

  calculateTotals(): this {
    this.order.calculateTotals();
    return this;
  }

  build(): Order {
    return this.order;
  }
}
```

#### Singleton Pattern
**Use Case**: Database connection pool, configuration manager, cache manager

```typescript
// config/DatabaseConnection.ts
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = createPool({ ... });
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  getConnection() {
    return this.pool;
  }
}
```

### 3.2 Structural Patterns

#### Adapter Pattern
**Use Case**: Adapting different shipping APIs, payment gateways to a common interface

```typescript
// services/shipping/ShippingAdapter.ts
interface ShippingProvider {
  calculateRate(from: Address, to: Address, weight: number): Promise<number>;
  createShipment(order: Order): Promise<Shipment>;
}

class FedExAdapter implements ShippingProvider {
  private fedexClient: FedExAPI;

  async calculateRate(from, to, weight) {
    const fedexRate = await this.fedexClient.getRates({ ... });
    return this.convertToStandardRate(fedexRate);
  }
}

class DHLAdapter implements ShippingProvider { ... }
```

#### Decorator Pattern
**Use Case**: Adding middleware, logging, caching, authentication layers

```typescript
// middleware/LoggingDecorator.ts
interface Service {
  execute(data: any): Promise<any>;
}

class LoggingDecorator implements Service {
  constructor(private service: Service) {}

  async execute(data: any) {
    console.log(`Executing ${this.service.constructor.name}`, data);
    const result = await this.service.execute(data);
    console.log(`Completed ${this.service.constructor.name}`, result);
    return result;
  }
}

class CacheDecorator implements Service {
  constructor(private service: Service, private cache: Redis) {}

  async execute(data: any) {
    const cacheKey = this.generateKey(data);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.service.execute(data);
    await this.cache.set(cacheKey, result, 3600);
    return result;
  }
}
```

#### Facade Pattern
**Use Case**: Simplifying complex subsystems like checkout, order fulfillment

```typescript
// services/checkout/CheckoutFacade.ts
class CheckoutFacade {
  constructor(
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private taxService: TaxService
  ) {}

  async processCheckout(cart: Cart, customer: Customer): Promise<Order> {
    // Complex orchestration simplified
    await this.inventoryService.reserveItems(cart.items);
    const taxes = await this.taxService.calculateTax(cart, customer.address);
    const payment = await this.paymentService.charge(customer, cart.total + taxes);
    const order = await this.orderService.createOrder(cart, customer, payment);
    await this.notificationService.sendOrderConfirmation(order);
    return order;
  }
}
```

### 3.3 Behavioral Patterns

#### Strategy Pattern
**Use Case**: Different pricing strategies, tax calculation strategies, discount strategies

```typescript
// services/pricing/PricingStrategy.ts
interface PricingStrategy {
  calculatePrice(product: Product, customer: Customer): number;
}

class RegularPricingStrategy implements PricingStrategy {
  calculatePrice(product, customer) {
    return product.basePrice;
  }
}

class WholesalePricingStrategy implements PricingStrategy {
  calculatePrice(product, customer) {
    return product.basePrice * 0.7; // 30% discount
  }
}

class TieredPricingStrategy implements PricingStrategy {
  calculatePrice(product, customer) {
    const quantity = customer.orderHistory.totalQuantity;
    if (quantity > 100) return product.basePrice * 0.6;
    if (quantity > 50) return product.basePrice * 0.75;
    return product.basePrice;
  }
}

class PricingContext {
  constructor(private strategy: PricingStrategy) {}

  setStrategy(strategy: PricingStrategy) {
    this.strategy = strategy;
  }

  getPrice(product: Product, customer: Customer) {
    return this.strategy.calculatePrice(product, customer);
  }
}
```

#### Observer Pattern
**Use Case**: Event notifications, webhook triggers, inventory updates

```typescript
// events/EventManager.ts
interface Observer {
  update(event: Event): void;
}

class EventManager {
  private observers: Map<string, Observer[]> = new Map();

  subscribe(eventType: string, observer: Observer) {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }
    this.observers.get(eventType).push(observer);
  }

  notify(event: Event) {
    const observers = this.observers.get(event.type) || [];
    observers.forEach(observer => observer.update(event));
  }
}

class InventoryObserver implements Observer {
  update(event: OrderCreatedEvent) {
    // Update inventory when order is created
  }
}

class EmailObserver implements Observer {
  update(event: OrderCreatedEvent) {
    // Send confirmation email
  }
}
```

#### Chain of Responsibility Pattern
**Use Case**: Request validation, discount application, middleware pipeline

```typescript
// middleware/ValidationChain.ts
abstract class ValidationHandler {
  private nextHandler: ValidationHandler;

  setNext(handler: ValidationHandler): ValidationHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request: Request): Promise<Response> {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

class AuthenticationHandler extends ValidationHandler {
  async handle(request: Request) {
    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }
    return super.handle(request);
  }
}

class RateLimitHandler extends ValidationHandler {
  async handle(request: Request) {
    if (await this.isRateLimited(request.ip)) {
      throw new TooManyRequestsException();
    }
    return super.handle(request);
  }
}

class ValidationMiddleware extends ValidationHandler {
  async handle(request: Request) {
    if (!this.validateSchema(request.body)) {
      throw new ValidationException();
    }
    return super.handle(request);
  }
}
```

#### Repository Pattern
**Use Case**: Data access abstraction

```typescript
// repositories/ProductRepository.ts
interface IProductRepository {
  findById(id: string): Promise<Product>;
  findAll(filters: ProductFilters): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

class ProductRepository implements IProductRepository {
  constructor(private db: PrismaClient) {}

  async findById(id: string): Promise<Product> {
    const data = await this.db.product.findUnique({ where: { id } });
    return this.mapToDomain(data);
  }

  async findAll(filters: ProductFilters): Promise<Product[]> {
    const data = await this.db.product.findMany({
      where: this.buildWhereClause(filters),
      include: { variants: true, images: true }
    });
    return data.map(this.mapToDomain);
  }

  private mapToDomain(data: any): Product {
    return new Product(data);
  }
}
```

### 3.4 Additional Patterns

#### Unit of Work Pattern
**Use Case**: Transaction management across multiple repositories

```typescript
// core/UnitOfWork.ts
class UnitOfWork {
  private transaction: PrismaTransaction;

  constructor(private prisma: PrismaClient) {}

  async execute<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      this.transaction = tx;
      return work(this);
    });
  }

  getProductRepository(): ProductRepository {
    return new ProductRepository(this.transaction);
  }

  getOrderRepository(): OrderRepository {
    return new OrderRepository(this.transaction);
  }
}
```

#### CQRS (Command Query Responsibility Segregation)
**Use Case**: Separating read and write operations

```typescript
// commands/CreateProductCommand.ts
interface Command {
  execute(): Promise<void>;
}

class CreateProductCommand implements Command {
  constructor(
    private productRepository: IProductRepository,
    private eventBus: EventBus,
    private data: CreateProductDTO
  ) {}

  async execute(): Promise<void> {
    const product = new Product(this.data);
    await this.productRepository.create(product);
    await this.eventBus.publish(new ProductCreatedEvent(product));
  }
}

// queries/GetProductQuery.ts
interface Query<T> {
  execute(): Promise<T>;
}

class GetProductQuery implements Query<ProductDTO> {
  constructor(
    private cache: Redis,
    private db: Prisma,
    private productId: string
  ) {}

  async execute(): Promise<ProductDTO> {
    // Check cache first
    const cached = await this.cache.get(`product:${this.productId}`);
    if (cached) return JSON.parse(cached);

    // Query read-optimized view
    const product = await this.db.productView.findUnique({
      where: { id: this.productId }
    });

    await this.cache.set(`product:${this.productId}`, JSON.stringify(product));
    return product;
  }
}
```

---

## 4. Core Modules

### 4.1 Authentication & Authorization Module

**Responsibilities**:
- User registration and login
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Permission management
- OAuth2/SSO integration

**Design Patterns**:
- Strategy Pattern (different auth methods)
- Decorator Pattern (adding MFA, rate limiting)
- Guard Pattern (NestJS guards for authorization)

**Key Components**:
```typescript
// auth/AuthService.ts
@Injectable()
class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private encryptionService: EncryptionService
  ) {}

  async register(dto: RegisterDTO): Promise<User> { ... }
  async login(credentials: LoginDTO): Promise<AuthToken> { ... }
  async validateToken(token: string): Promise<User> { ... }
  async refreshToken(refreshToken: string): Promise<AuthToken> { ... }
}

// auth/guards/RoleGuard.ts
@Injectable()
class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some(role => user.roles.includes(role));
  }
}
```

### 4.2 Store Management Module

**Responsibilities**:
- Store creation and configuration
- Theme customization
- Domain management
- Multi-store support

**Database Schema**:
```prisma
model Store {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  domain        String?  @unique
  customDomain  String?  @unique
  ownerId       String
  planId        String
  settings      Json     // Flexible settings storage
  theme         Json     // Theme configuration
  currency      String   @default("USD")
  locale        String   @default("en-US")
  timezone      String   @default("UTC")
  status        StoreStatus @default(ACTIVE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  owner         User     @relation(fields: [ownerId], references: [id])
  plan          Plan     @relation(fields: [planId], references: [id])
  products      Product[]
  orders        Order[]
  customers     Customer[]
  staff         StoreStaff[]

  @@index([ownerId])
  @@index([slug])
}

enum StoreStatus {
  ACTIVE
  SUSPENDED
  CLOSED
}
```

### 4.3 Product Management Module

**Responsibilities**:
- Product CRUD operations
- Variants and options (size, color, etc.)
- Inventory tracking
- Product categorization
- SEO optimization

**Database Schema**:
```prisma
model Product {
  id              String   @id @default(cuid())
  storeId         String
  title           String
  description     String?  @db.Text
  handle          String   // URL-friendly slug
  vendor          String?
  productType     String?
  tags            String[] // Array of tags
  status          ProductStatus @default(DRAFT)
  publishedAt     DateTime?
  seo             Json?    // SEO metadata

  // Pricing
  compareAtPrice  Decimal? @db.Decimal(10, 2)

  // Organization
  categoryId      String?
  collections     ProductCollection[]

  // Relations
  store           Store    @relation(fields: [storeId], references: [id])
  category        Category? @relation(fields: [categoryId], references: [id])
  variants        ProductVariant[]
  images          ProductImage[]
  options         ProductOption[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([storeId, handle])
  @@index([storeId, status])
  @@index([categoryId])
}

model ProductVariant {
  id              String   @id @default(cuid())
  productId       String
  sku             String?  @unique
  barcode         String?
  title           String
  price           Decimal  @db.Decimal(10, 2)
  compareAtPrice  Decimal? @db.Decimal(10, 2)
  costPrice       Decimal? @db.Decimal(10, 2)

  // Inventory
  inventoryQty    Int      @default(0)
  trackInventory  Boolean  @default(true)
  continueSellingWhenOutOfStock Boolean @default(false)

  // Physical
  weight          Decimal? @db.Decimal(10, 2)
  weightUnit      String?  @default("kg")

  // Variant options (e.g., {color: "Red", size: "L"})
  options         Json

  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  imageId         String?
  image           ProductImage? @relation(fields: [imageId], references: [id])

  orderItems      OrderLineItem[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([productId])
  @@index([sku])
}

model ProductOption {
  id          String   @id @default(cuid())
  productId   String
  name        String   // e.g., "Color", "Size"
  position    Int
  values      String[] // e.g., ["Red", "Blue", "Green"]

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

model ProductImage {
  id          String   @id @default(cuid())
  productId   String
  url         String
  altText     String?
  position    Int
  width       Int?
  height      Int?

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  variants    ProductVariant[]

  @@index([productId])
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}
```

### 4.4 Order Management Module

**Responsibilities**:
- Order creation and processing
- Order fulfillment workflow
- Refunds and cancellations
- Order status tracking
- Invoice generation

**Database Schema**:
```prisma
model Order {
  id                String   @id @default(cuid())
  orderNumber       String   @unique // Human-readable order number
  storeId           String
  customerId        String?

  // Financial
  subtotalPrice     Decimal  @db.Decimal(10, 2)
  totalTax          Decimal  @db.Decimal(10, 2)
  totalShipping     Decimal  @db.Decimal(10, 2)
  totalDiscount     Decimal  @db.Decimal(10, 2)
  totalPrice        Decimal  @db.Decimal(10, 2)
  currency          String

  // Status
  financialStatus   FinancialStatus
  fulfillmentStatus FulfillmentStatus
  orderStatus       OrderStatus

  // Customer Info
  email             String
  phone             String?

  // Addresses
  shippingAddress   Json
  billingAddress    Json

  // Metadata
  note              String?
  tags              String[]
  source            String   // 'web', 'mobile', 'admin'

  // Relations
  store             Store    @relation(fields: [storeId], references: [id])
  customer          Customer? @relation(fields: [customerId], references: [id])
  lineItems         OrderLineItem[]
  discounts         OrderDiscount[]
  transactions      Transaction[]
  fulfillments      Fulfillment[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([storeId, orderStatus])
  @@index([customerId])
  @@index([orderNumber])
}

model OrderLineItem {
  id              String   @id @default(cuid())
  orderId         String
  variantId       String

  title           String   // Product title at time of order
  variantTitle    String?
  sku             String?
  quantity        Int
  price           Decimal  @db.Decimal(10, 2)
  totalDiscount   Decimal  @db.Decimal(10, 2) @default(0)
  totalPrice      Decimal  @db.Decimal(10, 2)

  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant         ProductVariant @relation(fields: [variantId], references: [id])

  @@index([orderId])
  @@index([variantId])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  COMPLETED
  CANCELLED
}

enum FinancialStatus {
  PENDING
  AUTHORIZED
  PARTIALLY_PAID
  PAID
  PARTIALLY_REFUNDED
  REFUNDED
  VOIDED
}

enum FulfillmentStatus {
  UNFULFILLED
  PARTIALLY_FULFILLED
  FULFILLED
  SHIPPED
  DELIVERED
  RETURNED
}
```

### 4.5 Customer Management Module

**Responsibilities**:
- Customer profiles
- Customer groups and segments
- Customer lifetime value tracking
- Wishlist and favorites
- Customer notes and tags

**Database Schema**:
```prisma
model Customer {
  id              String   @id @default(cuid())
  storeId         String
  userId          String?  @unique // Link to User if they have an account

  firstName       String
  lastName        String
  email           String
  phone           String?

  // Segmentation
  tags            String[]
  note            String?

  // Marketing
  acceptsMarketing Boolean @default(false)

  // Metadata
  totalSpent      Decimal  @db.Decimal(10, 2) @default(0)
  ordersCount     Int      @default(0)

  // Relations
  store           Store    @relation(fields: [storeId], references: [id])
  user            User?    @relation(fields: [userId], references: [id])
  addresses       Address[]
  orders          Order[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([storeId, email])
  @@index([storeId])
}

model Address {
  id              String   @id @default(cuid())
  customerId      String

  firstName       String
  lastName        String
  company         String?
  address1        String
  address2        String?
  city            String
  province        String?  // State/Province
  country         String
  zip             String
  phone           String?

  isDefault       Boolean  @default(false)

  customer        Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([customerId])
}
```

### 4.6 Payment Module

**Responsibilities**:
- Payment gateway integration
- Payment processing
- Refund handling
- Payment method management
- PCI compliance

**Database Schema**:
```prisma
model Transaction {
  id              String   @id @default(cuid())
  orderId         String

  gateway         String   // 'stripe', 'paypal', etc.
  type            TransactionType
  status          TransactionStatus

  amount          Decimal  @db.Decimal(10, 2)
  currency        String

  gatewayTransactionId String?
  gatewayResponse Json?

  errorCode       String?
  errorMessage    String?

  order           Order    @relation(fields: [orderId], references: [id])

  createdAt       DateTime @default(now())

  @@index([orderId])
  @@index([gatewayTransactionId])
}

enum TransactionType {
  AUTHORIZATION
  CAPTURE
  SALE
  VOID
  REFUND
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILURE
  ERROR
}
```

### 4.7 Inventory Management Module

**Responsibilities**:
- Stock level tracking
- Low stock alerts
- Multi-location inventory
- Inventory history

**Database Schema**:
```prisma
model InventoryLocation {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  address     Json?
  isActive    Boolean  @default(true)

  store       Store    @relation(fields: [storeId], references: [id])
  items       InventoryItem[]

  @@index([storeId])
}

model InventoryItem {
  id              String   @id @default(cuid())
  variantId       String
  locationId      String

  available       Int      @default(0)
  committed       Int      @default(0) // Reserved for orders
  incoming        Int      @default(0) // On order from supplier

  variant         ProductVariant @relation(fields: [variantId], references: [id])
  location        InventoryLocation @relation(fields: [locationId], references: [id])

  updatedAt       DateTime @updatedAt

  @@unique([variantId, locationId])
  @@index([variantId])
  @@index([locationId])
}
```

### 4.8 Analytics Module

**Responsibilities**:
- Sales analytics
- Customer analytics
- Product performance
- Real-time dashboards
- Custom reports

**Implementation**:
```typescript
// services/analytics/AnalyticsService.ts
@Injectable()
class AnalyticsService {
  async getSalesOverview(storeId: string, period: DateRange): Promise<SalesMetrics> {
    return {
      totalRevenue: await this.calculateRevenue(storeId, period),
      totalOrders: await this.countOrders(storeId, period),
      averageOrderValue: await this.calculateAOV(storeId, period),
      conversionRate: await this.calculateConversionRate(storeId, period),
    };
  }

  async getTopProducts(storeId: string, limit: number): Promise<ProductMetrics[]> {
    // Implementation using aggregation queries
  }

  async getCustomerLifetimeValue(customerId: string): Promise<number> {
    // Implementation
  }
}
```

### 4.9 Plugin/Extension Module

**Responsibilities**:
- Plugin installation and management
- Webhook management
- API access for plugins
- Plugin marketplace

**Database Schema**:
```prisma
model Plugin {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String
  version         String
  author          String
  iconUrl         String?

  isActive        Boolean  @default(true)
  isFree          Boolean  @default(true)
  price           Decimal? @db.Decimal(10, 2)

  // Permissions
  permissions     String[] // e.g., ['read:products', 'write:orders']

  installations   PluginInstallation[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PluginInstallation {
  id          String   @id @default(cuid())
  storeId     String
  pluginId    String

  config      Json?    // Plugin-specific configuration
  isActive    Boolean  @default(true)

  store       Store    @relation(fields: [storeId], references: [id])
  plugin      Plugin   @relation(fields: [pluginId], references: [id])

  installedAt DateTime @default(now())

  @@unique([storeId, pluginId])
  @@index([storeId])
}

model Webhook {
  id          String   @id @default(cuid())
  storeId     String
  topic       String   // e.g., 'orders/create', 'products/update'
  address     String   // URL to send webhook to
  format      String   @default("json")

  isActive    Boolean  @default(true)

  store       Store    @relation(fields: [storeId], references: [id])

  createdAt   DateTime @default(now())

  @@index([storeId, topic])
}
```

---

## 5. Database Design

### 5.1 Multi-Tenancy Strategy

**Approach**: **Shared Database, Shared Schema with Tenant ID**

**Rationale**:
- Cost-effective for scaling to thousands of stores
- Easier maintenance and migrations
- Better resource utilization
- RLS (Row Level Security) for data isolation

**Implementation**:
```sql
-- Enable Row Level Security on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access by store_id
CREATE POLICY store_isolation_policy ON products
  USING (store_id = current_setting('app.current_store_id')::text);

-- Set context in application
-- This should be set per request
SET app.current_store_id = 'store_xyz123';
```

### 5.2 Database Sharding Strategy (Future)

When scaling beyond a single database:

**Sharding Key**: `store_id`

**Shard Distribution**:
```
Shard 1: Stores A-G
Shard 2: Stores H-N
Shard 3: Stores O-U
Shard 4: Stores V-Z
```

### 5.3 Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_products_store_status ON products(store_id, status);
CREATE INDEX idx_orders_store_created ON orders(store_id, created_at DESC);
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);

-- Partial indexes for active records
CREATE INDEX idx_active_products ON products(store_id)
  WHERE status = 'ACTIVE';

-- GIN indexes for JSON columns
CREATE INDEX idx_product_seo ON products USING GIN(seo);

-- Full-text search indexes
CREATE INDEX idx_product_search ON products
  USING GIN(to_tsvector('english', title || ' ' || description));
```

### 5.4 Caching Strategy

**Multi-Layer Caching**:

1. **Application Cache (Redis)**:
   - Session data (TTL: 24h)
   - Product catalog (TTL: 1h)
   - Store settings (TTL: 1h)
   - Cart data (TTL: 7 days)

2. **Database Query Cache**:
   - Frequently accessed read-only data

3. **CDN Cache**:
   - Product images
   - Static assets
   - Storefront pages

**Cache Invalidation**:
```typescript
// Event-driven cache invalidation
class CacheInvalidationObserver implements Observer {
  async update(event: ProductUpdatedEvent) {
    await this.cache.del(`product:${event.productId}`);
    await this.cache.del(`store:${event.storeId}:products`);
    await this.searchService.reindex(event.productId);
  }
}
```

---

## 6. API Design

### 6.1 GraphQL API (Primary)

**Schema Structure**:
```graphql
# Store Context
type Store {
  id: ID!
  name: String!
  domain: String
  settings: StoreSettings!
  products(first: Int, after: String, filters: ProductFilter): ProductConnection!
  orders(first: Int, after: String): OrderConnection!
  customers(first: Int, after: String): CustomerConnection!
}

# Product
type Product {
  id: ID!
  title: String!
  description: String
  handle: String!
  variants(first: Int): ProductVariantConnection!
  images: [ProductImage!]!
  options: [ProductOption!]!
  seo: SEO
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Queries
type Query {
  # Admin queries
  store(id: ID!): Store
  product(id: ID!): Product
  order(id: ID!): Order

  # Storefront queries
  products(first: Int, filters: ProductFilter): ProductConnection!
  collections(first: Int): CollectionConnection!

  # Analytics
  analytics(period: DateRange!): AnalyticsData!
}

# Mutations
type Mutation {
  # Product management
  createProduct(input: CreateProductInput!): ProductPayload!
  updateProduct(id: ID!, input: UpdateProductInput!): ProductPayload!
  deleteProduct(id: ID!): DeletePayload!

  # Order management
  createOrder(input: CreateOrderInput!): OrderPayload!
  fulfillOrder(id: ID!, input: FulfillOrderInput!): OrderPayload!

  # Customer
  createCustomer(input: CreateCustomerInput!): CustomerPayload!
}

# Subscriptions (Real-time updates)
type Subscription {
  orderCreated(storeId: ID!): Order!
  inventoryUpdated(productId: ID!): InventoryLevel!
}
```

**Pagination (Relay-style)**:
```graphql
type ProductConnection {
  edges: [ProductEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ProductEdge {
  cursor: String!
  node: Product!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 6.2 REST API (Mobile & Webhooks)

**Endpoint Structure**:
```
/api/v1/admin/
  /stores
  /products
  /orders
  /customers
  /analytics

/api/v1/storefront/
  /products
  /collections
  /cart
  /checkout

/api/v1/webhooks/
  /orders/created
  /products/updated
```

**Example Endpoint**:
```typescript
// controllers/ProductController.ts
@Controller('api/v1/admin/products')
@UseGuards(AuthGuard, StoreContextGuard)
export class ProductController {
  @Get()
  async list(
    @StoreContext() store: Store,
    @Query() query: ProductQueryDTO
  ): Promise<PaginatedResponse<Product>> {
    return this.productService.findAll(store.id, query);
  }

  @Post()
  @Roles('merchant', 'admin')
  async create(
    @StoreContext() store: Store,
    @Body() dto: CreateProductDTO
  ): Promise<Product> {
    return this.productService.create(store.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDTO
  ): Promise<Product> {
    return this.productService.update(id, dto);
  }
}
```

### 6.3 Rate Limiting

```typescript
// Rate limiting strategy
const rateLimits = {
  anonymous: { requests: 100, window: '15m' },
  authenticated: { requests: 1000, window: '15m' },
  premium: { requests: 5000, window: '15m' },
};

@UseGuards(RateLimitGuard)
@RateLimit({ requests: 1000, window: '15m' })
export class ProductController { ... }
```

### 6.4 API Versioning

**URL Versioning**: `/api/v1/`, `/api/v2/`

**Header Versioning (Alternative)**:
```
X-API-Version: 2024-01-01
```

---

## 7. Multi-Country Support

### 7.1 Internationalization (i18n)

**Database Schema**:
```prisma
model Translation {
  id          String   @id @default(cuid())
  resourceType String  // 'product', 'collection', etc.
  resourceId  String
  locale      String   // 'en-US', 'fr-FR', etc.
  field       String   // 'title', 'description'
  value       String   @db.Text

  @@unique([resourceType, resourceId, locale, field])
  @@index([resourceType, resourceId, locale])
}
```

**Implementation**:
```typescript
// services/i18n/TranslationService.ts
@Injectable()
class TranslationService {
  async translate<T>(
    entity: T,
    locale: string,
    fields: string[]
  ): Promise<T> {
    const translations = await this.getTranslations(
      entity.constructor.name,
      entity.id,
      locale,
      fields
    );

    return {
      ...entity,
      ...translations
    };
  }
}
```

### 7.2 Multi-Currency Support

**Currency Conversion**:
```typescript
// services/currency/CurrencyService.ts
@Injectable()
class CurrencyService {
  async convert(
    amount: number,
    from: string,
    to: string
  ): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return amount * rate;
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    // Fetch from cache or external API
    const cached = await this.cache.get(`rate:${from}:${to}`);
    if (cached) return parseFloat(cached);

    const rate = await this.fetchFromAPI(from, to);
    await this.cache.set(`rate:${from}:${to}`, rate, 3600);
    return rate;
  }
}
```

**Price Display**:
```prisma
model Price {
  id          String   @id @default(cuid())
  variantId   String
  currency    String
  amount      Decimal  @db.Decimal(10, 2)

  variant     ProductVariant @relation(fields: [variantId], references: [id])

  @@unique([variantId, currency])
}
```

### 7.3 Tax Calculation

**Tax Strategy Pattern**:
```typescript
interface TaxStrategy {
  calculate(order: Order): Promise<TaxAmount>;
}

class USTaxStrategy implements TaxStrategy {
  async calculate(order: Order): Promise<TaxAmount> {
    // Use Avalara or TaxJar API
    const state = order.shippingAddress.province;
    const rate = await this.getTaxRate(state);
    return {
      amount: order.subtotal * rate,
      breakdown: [...]
    };
  }
}

class EUTaxStrategy implements TaxStrategy {
  async calculate(order: Order): Promise<TaxAmount> {
    // VAT calculation based on country
    const country = order.shippingAddress.country;
    const vatRate = this.getVATRate(country);
    return {
      amount: order.subtotal * vatRate,
      breakdown: [...]
    };
  }
}

class IndiaTaxStrategy implements TaxStrategy {
  async calculate(order: Order): Promise<TaxAmount> {
    // GST calculation
    const gstRate = 0.18; // 18% GST
    return {
      amount: order.subtotal * gstRate,
      breakdown: [
        { type: 'CGST', amount: order.subtotal * 0.09 },
        { type: 'SGST', amount: order.subtotal * 0.09 }
      ]
    };
  }
}
```

### 7.4 Shipping Zones

```prisma
model ShippingZone {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  countries   String[] // ISO country codes

  store       Store    @relation(fields: [storeId], references: [id])
  rates       ShippingRate[]

  @@index([storeId])
}

model ShippingRate {
  id          String   @id @default(cuid())
  zoneId      String
  name        String
  price       Decimal  @db.Decimal(10, 2)

  // Conditions
  minOrderValue Decimal? @db.Decimal(10, 2)
  maxOrderValue Decimal? @db.Decimal(10, 2)

  zone        ShippingZone @relation(fields: [zoneId], references: [id])

  @@index([zoneId])
}
```

### 7.5 Payment Gateway by Region

```typescript
// Factory pattern for region-specific gateways
class PaymentGatewayFactory {
  static create(country: string): PaymentProcessor {
    const regionMap = {
      'US': () => new StripeProcessor(),
      'IN': () => new RazorpayProcessor(),
      'BR': () => new MercadoPagoProcessor(),
      'EU': () => new StripeProcessor(),
    };

    const region = this.getRegion(country);
    return regionMap[region]();
  }
}
```

---

## 8. Scalability Strategy

### 8.1 Horizontal Scaling

**Service Replication**:
- Run multiple instances of each microservice
- Load balancer distributes traffic
- Stateless service design

**Database Scaling**:
- Read replicas for read-heavy operations
- Connection pooling (PgBouncer)
- Query optimization and indexing

### 8.2 Caching Strategy

**Multi-Level Caching**:
```typescript
// Decorator for automatic caching
function Cacheable(ttl: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = await redis.get(cacheKey);

      if (cached) return JSON.parse(cached);

      const result = await originalMethod.apply(this, args);
      await redis.set(cacheKey, JSON.stringify(result), 'EX', ttl);

      return result;
    };
  };
}

class ProductService {
  @Cacheable(3600)
  async getProduct(id: string): Promise<Product> {
    return this.repository.findById(id);
  }
}
```

### 8.3 Database Optimization

**Read/Write Splitting**:
```typescript
// Use read replica for queries
const readConnection = getReadReplicaConnection();
const writeConnection = getPrimaryConnection();

// CQRS implementation
class ProductQueryService {
  async findAll(filters: Filters) {
    return readConnection.product.findMany({ where: filters });
  }
}

class ProductCommandService {
  async create(data: CreateProductDTO) {
    return writeConnection.product.create({ data });
  }
}
```

**Query Optimization**:
```typescript
// Use DataLoader for batch loading
const productLoader = new DataLoader(async (ids: string[]) => {
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    include: { variants: true, images: true }
  });

  return ids.map(id => products.find(p => p.id === id));
});
```

### 8.4 Asynchronous Processing

**Message Queue (RabbitMQ/Kafka)**:
```typescript
// Producer
class OrderService {
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    const order = await this.repository.create(data);

    // Publish to queue for async processing
    await this.messageQueue.publish('order.created', {
      orderId: order.id,
      customerId: order.customerId
    });

    return order;
  }
}

// Consumer
@Consumer('order.created')
class OrderCreatedConsumer {
  async handle(message: OrderCreatedEvent) {
    await this.inventoryService.reserveItems(message.orderId);
    await this.emailService.sendConfirmation(message.customerId);
    await this.analyticsService.trackOrder(message.orderId);
  }
}
```

### 8.5 CDN Strategy

**Static Assets**:
- Product images: CloudFront/Cloudflare
- JS/CSS bundles: CDN with versioning
- Storefront pages: Edge caching

**Cache Headers**:
```typescript
// Set appropriate cache headers
@Get('products/:id')
@Header('Cache-Control', 'public, max-age=3600')
async getProduct(@Param('id') id: string) {
  return this.productService.findById(id);
}
```

### 8.6 Monitoring & Observability

**Metrics to Track**:
- Request latency (p50, p95, p99)
- Error rates
- Database query performance
- Cache hit/miss ratio
- Queue length
- Active connections

**Tools**:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Jaeger**: Distributed tracing
- **ELK Stack**: Log aggregation

```typescript
// Custom metrics
import { Counter, Histogram } from 'prom-client';

const orderCounter = new Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created'
});

const orderProcessingTime = new Histogram({
  name: 'order_processing_duration_seconds',
  help: 'Order processing duration'
});

@Injectable()
class OrderService {
  async createOrder(data: CreateOrderDTO) {
    const timer = orderProcessingTime.startTimer();

    try {
      const order = await this.processOrder(data);
      orderCounter.inc();
      return order;
    } finally {
      timer();
    }
  }
}
```

---

## 9. Mobile Application

### 9.1 Architecture

**App Structure**:
```
mobile/
├── src/
│   ├── app/              # App entry point
│   ├── screens/          # Screen components
│   │   ├── admin/        # Admin app screens
│   │   └── storefront/   # Customer app screens
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── store/           # Redux store
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── utils/           # Utilities
```

### 9.2 State Management

**Redux Toolkit**:
```typescript
// store/slices/productSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (storeId: string, { getState }) => {
    const response = await api.getProducts(storeId);
    return response.data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  }
});
```

### 9.3 Offline Support

**Offline-First Architecture**:
```typescript
// services/OfflineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineService {
  async syncData() {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);

    if (isConnected) {
      const pendingActions = await this.getPendingActions();

      for (const action of pendingActions) {
        try {
          await this.executeAction(action);
          await this.removePendingAction(action.id);
        } catch (error) {
          // Will retry on next sync
        }
      }
    }
  }

  async queueAction(action: OfflineAction) {
    const pending = await this.getPendingActions();
    pending.push(action);
    await AsyncStorage.setItem('pendingActions', JSON.stringify(pending));
  }
}
```

### 9.4 Push Notifications

```typescript
// services/NotificationService.ts
import messaging from '@react-native-firebase/messaging';

class NotificationService {
  async initialize() {
    const authStatus = await messaging().requestPermission();

    if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      const token = await messaging().getToken();
      await this.registerDevice(token);
    }

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      this.showNotification(remoteMessage);
    });
  }

  async registerDevice(token: string) {
    await api.post('/devices', { token, platform: Platform.OS });
  }
}
```

---

## 10. Security Architecture

### 10.1 Authentication & Authorization

**JWT Strategy**:
```typescript
// Guards and middleware
@Injectable()
class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

**Permission System**:
```typescript
enum Permission {
  // Product permissions
  PRODUCT_READ = 'product:read',
  PRODUCT_WRITE = 'product:write',
  PRODUCT_DELETE = 'product:delete',

  // Order permissions
  ORDER_READ = 'order:read',
  ORDER_WRITE = 'order:write',
  ORDER_REFUND = 'order:refund',

  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',
}

@Roles(Permission.PRODUCT_WRITE)
@Post('products')
async createProduct() { ... }
```

### 10.2 Data Security

**Encryption at Rest**:
```typescript
// Encrypt sensitive data before storage
class EncryptionService {
  encrypt(data: string): string {
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, this.iv);
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  }

  decrypt(encrypted: string): string {
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, this.iv);
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
}
```

**PCI Compliance**:
- Never store full credit card numbers
- Use tokenization (Stripe, PayPal tokens)
- Secure transmission (HTTPS only)

### 10.3 Input Validation

```typescript
// DTOs with validation
import { IsString, IsNumber, Min, Max, IsEmail } from 'class-validator';

class CreateProductDTO {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;
}

// Usage in controller
@Post()
async create(@Body(ValidationPipe) dto: CreateProductDTO) {
  return this.productService.create(dto);
}
```

### 10.4 SQL Injection Prevention

Using Prisma ORM (parameterized queries):
```typescript
// Safe - Prisma automatically parameterizes
await prisma.product.findMany({
  where: {
    title: { contains: userInput }
  }
});

// Never use raw queries with user input
// UNSAFE: await prisma.$queryRaw`SELECT * FROM products WHERE title = '${userInput}'`
```

### 10.5 XSS Prevention

```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

class SanitizationService {
  sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty);
  }
}

// In API
@Post('products')
async create(@Body() dto: CreateProductDTO) {
  dto.description = this.sanitizer.sanitizeHtml(dto.description);
  return this.service.create(dto);
}
```

### 10.6 Rate Limiting & DDoS Protection

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
@Controller('api')
export class ApiController { ... }
```

### 10.7 API Security

**API Key Management**:
```prisma
model ApiKey {
  id          String   @id @default(cuid())
  storeId     String
  key         String   @unique
  name        String
  permissions String[]

  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean  @default(true)

  store       Store    @relation(fields: [storeId], references: [id])

  @@index([key])
}
```

---

## 11. Plugin/Extension System

### 11.1 Plugin Architecture

**Plugin Lifecycle**:
```typescript
interface Plugin {
  install(context: PluginContext): Promise<void>;
  uninstall(context: PluginContext): Promise<void>;
  configure(config: PluginConfig): Promise<void>;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  async installPlugin(pluginId: string, storeId: string) {
    const plugin = await this.loadPlugin(pluginId);
    const context = this.createContext(storeId);

    await plugin.install(context);
    this.plugins.set(pluginId, plugin);

    await this.registerWebhooks(plugin, storeId);
  }

  async uninstallPlugin(pluginId: string, storeId: string) {
    const plugin = this.plugins.get(pluginId);
    const context = this.createContext(storeId);

    await plugin.uninstall(context);
    await this.removeWebhooks(pluginId, storeId);

    this.plugins.delete(pluginId);
  }
}
```

### 11.2 Webhook System

```typescript
// Webhook delivery system
@Injectable()
class WebhookService {
  async deliverWebhook(
    webhook: Webhook,
    event: WebhookEvent
  ): Promise<void> {
    const payload = {
      topic: event.topic,
      store_id: event.storeId,
      created_at: new Date().toISOString(),
      data: event.data
    };

    try {
      await axios.post(webhook.address, payload, {
        headers: {
          'X-Webhook-Signature': this.generateSignature(payload),
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      await this.logSuccess(webhook.id, event.id);
    } catch (error) {
      await this.logFailure(webhook.id, event.id, error);
      await this.retryLater(webhook, event);
    }
  }

  private generateSignature(payload: any): string {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    return hmac.update(JSON.stringify(payload)).digest('hex');
  }
}
```

### 11.3 Plugin API Access

**Scoped API Keys**:
```typescript
@UseGuards(ApiKeyGuard)
@Controller('api/v1/plugin')
export class PluginApiController {
  @Get('products')
  @RequirePermissions('read:products')
  async getProducts(@PluginContext() context: PluginContext) {
    return this.productService.findAll(context.storeId);
  }
}
```

---

## 12. Admin Customization

### 12.1 Customizable Dashboard

**Widget System**:
```prisma
model DashboardWidget {
  id          String   @id @default(cuid())
  storeId     String
  type        String   // 'sales_chart', 'top_products', 'recent_orders'
  position    Int
  size        String   // 'small', 'medium', 'large'
  config      Json     // Widget-specific configuration
  isVisible   Boolean  @default(true)

  store       Store    @relation(fields: [storeId], references: [id])

  @@index([storeId, position])
}
```

**Widget Components**:
```typescript
// Registry of available widgets
const widgetRegistry = {
  'sales_chart': SalesChartWidget,
  'top_products': TopProductsWidget,
  'recent_orders': RecentOrdersWidget,
  'inventory_alerts': InventoryAlertsWidget,
};

// Dashboard component
function Dashboard() {
  const { widgets } = useDashboardWidgets();

  return (
    <GridLayout>
      {widgets.map(widget => {
        const WidgetComponent = widgetRegistry[widget.type];
        return (
          <WidgetComponent
            key={widget.id}
            config={widget.config}
            size={widget.size}
          />
        );
      })}
    </GridLayout>
  );
}
```

### 12.2 Custom Fields

```prisma
model CustomField {
  id          String   @id @default(cuid())
  storeId     String
  namespace   String   // 'product', 'customer', 'order'
  key         String
  label       String
  type        FieldType // 'text', 'number', 'boolean', 'date', 'select'
  options     Json?    // For select fields
  required    Boolean  @default(false)

  store       Store    @relation(fields: [storeId], references: [id])

  @@unique([storeId, namespace, key])
}

model CustomFieldValue {
  id          String   @id @default(cuid())
  fieldId     String
  resourceId  String   // ID of product/customer/order
  value       String   @db.Text

  field       CustomField @relation(fields: [fieldId], references: [id])

  @@unique([fieldId, resourceId])
}
```

### 12.3 Theme Customization

```typescript
// Theme configuration
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
  };
  layout: {
    headerStyle: 'fixed' | 'static';
    sidebarPosition: 'left' | 'right';
  };
  customCSS?: string;
}

// Store theme in database
model StoreTheme {
  id          String   @id @default(cuid())
  storeId     String   @unique
  config      Json     // ThemeConfig

  store       Store    @relation(fields: [storeId], references: [id])
}
```

### 12.4 Workflow Automation

```prisma
model Workflow {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  trigger     Json     // { type: 'order_created', conditions: [...] }
  actions     Json     // [{ type: 'send_email', config: {...} }]
  isActive    Boolean  @default(true)

  store       Store    @relation(fields: [storeId], references: [id])
  executions  WorkflowExecution[]
}

// Example workflow
{
  "trigger": {
    "type": "order_created",
    "conditions": [
      { "field": "total", "operator": "greater_than", "value": 100 }
    ]
  },
  "actions": [
    {
      "type": "send_email",
      "config": {
        "template": "high_value_order",
        "recipient": "merchant@store.com"
      }
    },
    {
      "type": "add_tag",
      "config": {
        "tag": "high-value-customer"
      }
    }
  ]
}
```

---

## 13. Deployment Strategy

### 13.1 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t ecomify:${{ github.sha }} .
      - name: Push to registry
        run: docker push ecomify:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: kubectl set image deployment/ecomify ecomify=ecomify:${{ github.sha }}
```

### 13.2 Infrastructure as Code

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api-server
        image: ecomify/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

```typescript
// tests/unit/ProductService.test.ts
describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    service = new ProductService(repository);
  });

  it('should create product', async () => {
    const dto = { title: 'Test Product', price: 99.99 };
    const expected = { id: '1', ...dto };

    repository.create.mockResolvedValue(expected);

    const result = await service.create('store-1', dto);

    expect(result).toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });
});
```

### 14.2 Integration Tests

```typescript
// tests/integration/ProductAPI.test.ts
describe('Product API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('GET /products', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

### 14.3 E2E Tests

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('complete checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('text=Add to Cart');
  await page.click('text=Checkout');

  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=cardNumber]', '4242424242424242');

  await page.click('text=Pay Now');

  await expect(page.locator('text=Order confirmed')).toBeVisible();
});
```

---

## 15. Performance Targets

### 15.1 Response Time Targets

- API endpoints: < 200ms (p95)
- Database queries: < 50ms (p95)
- Page load time: < 2s (First Contentful Paint)
- Time to Interactive: < 3s

### 15.2 Throughput Targets

- 10,000 requests/second per service
- 1,000 concurrent users per store
- 100,000 products per store
- 10,000 orders/day per store

### 15.3 Availability

- 99.9% uptime SLA
- < 1 hour/month downtime
- Automated failover
- Zero-downtime deployments

---

## Conclusion

This design document provides a comprehensive blueprint for building Ecomify, a scalable, multi-tenant e-commerce platform with extensive customization capabilities. The architecture leverages industry-standard design patterns, modern technologies, and best practices to ensure:

1. **Scalability**: Horizontal scaling, caching, and microservices
2. **Maintainability**: Clean architecture, design patterns, and separation of concerns
3. **Extensibility**: Plugin system and customization options
4. **Global Reach**: Multi-country, multi-currency, and multi-language support
5. **Security**: Authentication, authorization, and data protection
6. **Performance**: Optimized queries, caching, and CDN

