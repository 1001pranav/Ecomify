# Ecomify Backend - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running Services](#running-services)
6. [Docker Deployment](#docker-deployment)
7. [Production Deployment](#production-deployment)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v20.x or higher
- **npm**: v9.x or higher
- **Docker**: v24.x or higher
- **Docker Compose**: v2.x or higher
- **PostgreSQL**: v14.x or higher (if running natively)
- **Redis**: v7.x or higher (if running natively)
- **RabbitMQ**: v3.x or higher (if running natively)

### Optional Tools

- **Prisma CLI**: `npm install -g prisma`
- **NestJS CLI**: `npm install -g @nestjs/cli`
- **Turbo**: `npm install -g turbo`

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ecomify.git
cd ecomify/backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo including all services and packages.

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your local configuration. See [Environment Configuration](#environment-configuration) for details.

### 4. Start Infrastructure Services

```bash
npm run docker:up
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- RabbitMQ (port 5672, management UI: 15672)
- Elasticsearch (port 9200)
- PgBouncer (port 6432)

### 5. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### 6. Start Development Server

```bash
# Start all services in development mode
npm run dev

# Or start specific service
npm run dev --workspace=@ecomify/api-gateway
```

### 7. Verify Installation

- **API Gateway**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Health Check**: http://localhost:3000/health
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

---

## Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecomify?schema=public
DATABASE_REPLICA_URL=postgresql://postgres:password@localhost:5433/ecomify?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRES_IN=7d

# API Gateway
API_GATEWAY_PORT=3000

# Service Ports
AUTH_SERVICE_PORT=3001
STORE_SERVICE_PORT=3002
PRODUCT_SERVICE_PORT=3003
ORDER_SERVICE_PORT=3004
PAYMENT_SERVICE_PORT=3005
INVENTORY_SERVICE_PORT=3006
CUSTOMER_SERVICE_PORT=3007
ANALYTICS_SERVICE_PORT=3008
NOTIFICATION_SERVICE_PORT=3009
EMAIL_SERVICE_PORT=3010
PLUGIN_SERVICE_PORT=3011

# External Services
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@ecomify.com

# Environment
NODE_ENV=development
LOG_LEVEL=debug

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Database Setup

### Prisma Schema Management

```bash
# Generate Prisma Client
cd packages/database
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio
```

### Manual Database Operations

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d ecomify

# Backup database
pg_dump -h localhost -U postgres ecomify > backup.sql

# Restore database
psql -h localhost -U postgres ecomify < backup.sql
```

---

## Running Services

### Development Mode

```bash
# Run all services with hot-reload
npm run dev

# Run specific service
npm run dev --workspace=@ecomify/api-gateway

# Run with debugging
NODE_ENV=development LOG_LEVEL=debug npm run dev
```

### Build Services

```bash
# Build all services
npm run build

# Build specific service
npm run build --workspace=@ecomify/api-gateway
```

### Production Mode

```bash
# Build first
npm run build

# Start in production mode
npm run start

# Start specific service
npm run start --workspace=@ecomify/api-gateway
```

---

## Docker Deployment

### Build Docker Images

```bash
# Build API Gateway
docker build -f services/api-gateway/Dockerfile -t ecomify/api-gateway:latest .

# Build Auth Service
docker build -f services/auth-service/Dockerfile -t ecomify/auth-service:latest .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Docker Compose Configuration

The `docker-compose.yml` includes:
- PostgreSQL with persistent volume
- Redis with persistent volume
- RabbitMQ with management UI
- Elasticsearch
- PgBouncer (connection pooler)

---

## Production Deployment

### Using Docker Compose (Simple)

```bash
# Set environment to production
export NODE_ENV=production

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Check health
docker-compose ps
```

### Using Kubernetes (Recommended)

```bash
# Create namespace
kubectl create namespace ecomify-prod

# Apply configurations
kubectl apply -f k8s/production/

# Check deployment status
kubectl get pods -n ecomify-prod

# Check logs
kubectl logs -f deployment/api-gateway -n ecomify-prod
```

### Environment-Specific Configurations

#### Staging
- Branch: `develop`
- Auto-deploy on merge
- URL: https://staging.ecomify.com

#### Production
- Branch: `main`
- Manual approval required
- URL: https://ecomify.com

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline runs on:
- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`

#### Pipeline Stages

1. **Lint and Test**
   - ESLint checks
   - Prettier formatting check
   - Unit tests
   - Coverage report

2. **Build Services**
   - Build all microservices
   - Upload build artifacts

3. **Build Docker Images**
   - Multi-stage Docker builds
   - Push to Docker Hub
   - Tag with branch and SHA

4. **Deploy to Staging**
   - Auto-deploy on `develop` branch
   - Run smoke tests
   - Notify team

5. **Deploy to Production**
   - Manual approval required
   - Deploy on `main` branch
   - Run health checks
   - Notify team

### Required Secrets

Add these secrets to your GitHub repository:

```
DOCKER_USERNAME
DOCKER_PASSWORD
STAGING_SSH_KEY
PRODUCTION_SSH_KEY
SLACK_WEBHOOK_URL
```

---

## Monitoring and Logging

### Health Checks

All services expose health check endpoints:

```bash
# API Gateway
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/health/readiness

# Liveness check
curl http://localhost:3000/health/liveness
```

### Logging

Logs are structured and include:
- Timestamp
- Service name
- Log level (debug, info, warn, error)
- Request ID
- User ID (if authenticated)

### Monitoring Tools

- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Jaeger**: Distributed tracing
- **ELK Stack**: Log aggregation

---

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U postgres -d ecomify

# View logs
docker-compose logs postgres
```

#### Redis Connection Failed

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping

# View logs
docker-compose logs redis
```

#### RabbitMQ Connection Failed

```bash
# Check RabbitMQ is running
docker-compose ps rabbitmq

# Access management UI
open http://localhost:15672

# View logs
docker-compose logs rabbitmq
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Prisma Client Not Generated

```bash
# Generate Prisma Client
cd packages/database
npx prisma generate

# Or from root
npm run prisma:generate
```

### Getting Help

- **Documentation**: https://docs.ecomify.com
- **Issues**: https://github.com/your-org/ecomify/issues
- **Slack**: #ecomify-backend
- **Email**: backend-team@ecomify.com

---

## Design Patterns Implemented

Sprint 0 implements the following design patterns:

1. **Singleton Pattern**
   - Database connection (`packages/database/src/client/prisma.ts`)
   - Redis client (`packages/database/src/client/redis.ts`)
   - Queue connection (`packages/queue/src/queue/connection.ts`)
   - Logger (`packages/shared/src/utils/logger.ts`)
   - Environment configuration (`packages/shared/src/config/environment.ts`)

2. **Repository Pattern**
   - Base repository (`packages/database/src/repositories/base.repository.ts`)
   - User repository example

3. **Factory Pattern**
   - Queue factory (`packages/queue/src/queue/factory.ts`)
   - ID generators (`packages/shared/src/utils/generators.ts`)
   - Validator factory (`packages/types/src/validators.ts`)

4. **Observer Pattern**
   - Event publisher (`packages/queue/src/queue/publisher.ts`)
   - Event consumer (`packages/queue/src/queue/consumer.ts`)

5. **API Gateway Pattern**
   - Centralized routing (`services/api-gateway`)
   - Rate limiting
   - Authentication
   - Request logging

6. **Chain of Responsibility**
   - Middleware pipeline (logger, auth, etc.)

7. **Decorator Pattern**
   - NestJS decorators (`@Public`, `@Roles`)
   - Interceptors (logging, transformation)

8. **Strategy Pattern**
   - Validators (`packages/types/src/validators.ts`)
   - Multiple authentication strategies

---

## Next Steps

After completing Sprint 0, proceed with:

1. **Sprint 1**: Authentication & Authorization Service
2. **Sprint 2**: Store Management Service
3. **Sprint 3**: Product Catalog Service

Refer to `docs/sprint-plan-backend.md` for detailed requirements.

---

**Last Updated**: 2024-11-17
**Version**: 1.0.0
