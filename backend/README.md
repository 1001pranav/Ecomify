# Ecomify Backend - Microservices

A scalable, modular e-commerce platform backend built with NestJS microservices architecture.

## 🏗️ Architecture

- **Microservices**: 12 independent services
- **Event-Driven**: RabbitMQ for inter-service communication
- **Database**: PostgreSQL with Row-Level Security
- **Caching**: Redis for performance
- **Search**: Elasticsearch for product search
- **API Gateway**: Centralized entry point

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Main entry point, GraphQL & REST APIs |
| Auth Service | 3001 | Authentication & authorization |
| Store Service | 3002 | Store management |
| Product Service | 3003 | Product catalog & search |
| Order Service | 3004 | Order processing & fulfillment |
| Payment Service | 3005 | Payment processing |
| Inventory Service | 3006 | Inventory tracking |
| Customer Service | 3007 | Customer management |
| Analytics Service | 3008 | Analytics & reporting |
| Notification Service | 3009 | Push notifications |
| Email Service | 3010 | Email delivery |
| Plugin Service | 3011 | Plugin management |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+
- RabbitMQ 3+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure services**
   ```bash
   npm run docker:up
   ```

5. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

6. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

7. **Start development servers**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services
- `npm run start` - Start all services in production mode
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run prisma:studio` - Open Prisma Studio

## 🗂️ Project Structure

```
backend/
├── services/
│   ├── api-gateway/       # API Gateway service
│   ├── auth-service/      # Authentication service
│   ├── store-service/     # Store management
│   ├── product-service/   # Product catalog
│   ├── order-service/     # Order processing
│   ├── payment-service/   # Payment handling
│   ├── inventory-service/ # Inventory tracking
│   ├── customer-service/  # Customer management
│   ├── analytics-service/ # Analytics & reporting
│   ├── notification-service/ # Notifications
│   ├── email-service/     # Email delivery
│   └── plugin-service/    # Plugin management
├── packages/
│   ├── shared/            # Shared utilities
│   ├── types/             # TypeScript types
│   └── utils/             # Common utilities
├── infrastructure/
│   ├── docker/            # Docker configurations
│   └── kubernetes/        # K8s manifests
├── docker-compose.yml
├── turbo.json
└── package.json
```

## 🔧 Service Development

### Creating a New Service

```bash
cd services
mkdir my-service
cd my-service
npm init -y
```

### Service Template Structure

```
my-service/
├── src/
│   ├── modules/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   ├── dto/
│   ├── events/
│   ├── main.ts
│   └── app.module.ts
├── test/
├── package.json
└── tsconfig.json
```

## 🎨 Design Patterns Used

- **Repository Pattern** - Data access abstraction
- **Factory Pattern** - Object creation
- **Strategy Pattern** - Algorithm selection
- **Observer Pattern** - Event handling
- **Saga Pattern** - Distributed transactions
- **CQRS** - Command/Query separation
- **Circuit Breaker** - Fault tolerance

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific service
cd services/auth-service
npm test

# Run tests with coverage
npm run test:cov
```

## 📊 Database

### Prisma Schema

Database schema is defined in `packages/database/prisma/schema.prisma`

### Migrations

```bash
# Create a new migration
npm run prisma:migrate -- --name migration_name

# Apply migrations
npm run prisma:migrate

# Reset database (dev only)
npm run prisma:migrate -- reset
```

## 🔐 Security

- JWT-based authentication
- Row-Level Security (RLS) for multi-tenancy
- API rate limiting
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS protection

## 📈 Monitoring

- **Logs**: Structured logging with Winston
- **Metrics**: Prometheus metrics
- **Tracing**: Distributed tracing with Jaeger
- **Health Checks**: `/health` endpoint on each service

## 🚢 Deployment

### Docker

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f infrastructure/kubernetes/

# Check deployments
kubectl get pods -n ecomify
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter and tests
5. Submit a pull request

## 📝 License

MIT

## 📧 Support

For support, email support@ecomify.com
