# Ecomify Backend - Microservices Platform

[![CI/CD](https://github.com/your-org/ecomify/workflows/Backend%20CI/CD/badge.svg)](https://github.com/your-org/ecomify/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Backend microservices architecture for the Ecomify e-commerce platform, built with Node.js, TypeScript, NestJS, and following industry-standard design patterns.

## 🏗️ Architecture Overview

This backend implements a **microservices architecture** with the following principles:

- **Service Independence**: Each service can function standalone
- **Event-Driven Communication**: Services communicate via RabbitMQ message queue
- **API Gateway Pattern**: Centralized routing and authentication
- **Database Per Service**: Logical separation using PostgreSQL schemas
- **Containerization**: Docker-based deployment
- **CI/CD Automation**: GitHub Actions workflow

### Design Patterns Implemented

- ✅ **Singleton Pattern** - Database, Redis, Queue connections
- ✅ **Repository Pattern** - Data access abstraction
- ✅ **Factory Pattern** - Queue, ID generators, validators
- ✅ **Observer Pattern** - Event publishers and consumers
- ✅ **API Gateway Pattern** - Centralized routing
- ✅ **Chain of Responsibility** - Middleware pipeline
- ✅ **Decorator Pattern** - NestJS decorators and interceptors
- ✅ **Strategy Pattern** - Validators and auth strategies

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20.x or higher
- **Docker** v24.x or higher
- **Docker Compose** v2.x or higher

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment

\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### 3. Start Infrastructure

\`\`\`bash
npm run docker:up
\`\`\`

This starts PostgreSQL, Redis, RabbitMQ, Elasticsearch, and PgBouncer.

### 4. Setup Database

\`\`\`bash
npm run prisma:generate
npm run prisma:migrate
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

### 6. Verify Installation

- **API Gateway**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Health Check**: http://localhost:3000/health

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Comprehensive deployment instructions
- **[Sprint Plan](../docs/sprint-plan-backend.md)** - 16-week development roadmap

## 📋 Sprint Progress

### ✅ Sprint 0: Foundation & Infrastructure - COMPLETED

- [x] Project Setup (Monorepo, TypeScript, ESLint, Prettier, Husky)
- [x] Database Infrastructure (PostgreSQL, Prisma, Redis, PgBouncer)
- [x] Message Queue Setup (RabbitMQ with Factory & Observer patterns)
- [x] API Gateway Setup (NestJS, GraphQL, Rate Limiting, CORS)
- [x] CI/CD Pipeline (GitHub Actions)

**Design Patterns**: Singleton, Repository, Factory, Observer, API Gateway, Decorator, Strategy

See [Sprint Plan](../docs/sprint-plan-backend.md) for complete roadmap.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Ecomify Backend Team**
