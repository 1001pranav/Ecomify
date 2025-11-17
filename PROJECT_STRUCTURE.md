# Ecomify - Complete Project Structure

## Overview
This document provides a complete overview of the Ecomify project structure.

## Root Directory
\`\`\`
Ecomify/
├── backend/           # Backend microservices
├── web/              # Web applications (Admin + Storefront)
├── mobile/           # Mobile applications (Merchant + Customer)
├── docs/             # Documentation
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md
\`\`\`

## Backend Structure

\`\`\`
backend/
├── services/                    # Microservices
│   ├── api-gateway/            # Port 3000 - Main API Gateway
│   │   ├── src/
│   │   │   ├── graphql/        # GraphQL resolvers
│   │   │   ├── rest/           # REST controllers
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── guards/         # Auth guards
│   │   │   ├── filters/        # Exception filters
│   │   │   ├── main.ts
│   │   │   └── app.module.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth-service/           # Port 3001 - Authentication
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules
│   │   │   ├── entities/       # Database entities
│   │   │   ├── repositories/   # Data repositories
│   │   │   ├── services/       # Business logic
│   │   │   ├── controllers/    # HTTP controllers
│   │   │   ├── dto/            # Data transfer objects
│   │   │   ├── guards/         # Auth guards
│   │   │   ├── strategies/     # Passport strategies
│   │   │   └── events/         # Event publishers
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── store-service/          # Port 3002 - Store Management
│   ├── product-service/        # Port 3003 - Product Catalog
│   ├── order-service/          # Port 3004 - Order Processing
│   ├── payment-service/        # Port 3005 - Payment Gateway
│   ├── inventory-service/      # Port 3006 - Inventory Tracking
│   ├── customer-service/       # Port 3007 - Customer Management
│   ├── analytics-service/      # Port 3008 - Analytics & Reporting
│   ├── notification-service/   # Port 3009 - Push Notifications
│   ├── email-service/          # Port 3010 - Email Delivery
│   └── plugin-service/         # Port 3011 - Plugin Management
│
├── packages/                   # Shared packages
│   ├── shared/                # Shared utilities
│   ├── types/                 # TypeScript types
│   └── utils/                 # Common utilities
│
├── infrastructure/
│   ├── docker/                # Docker configurations
│   └── kubernetes/            # K8s manifests
│
├── docker-compose.yml         # Local development stack
├── turbo.json                 # Turborepo config
├── tsconfig.json              # TypeScript config
├── .eslintrc.json             # ESLint config
├── .prettierrc                # Prettier config
├── .env.example               # Environment template
├── package.json               # Root package.json
└── README.md                  # Backend documentation
\`\`\`

## Web Structure

\`\`\`
web/
├── apps/
│   ├── admin/                 # Admin Dashboard (Port 3000)
│   │   ├── app/              # Next.js App Router
│   │   │   ├── (auth)/       # Auth routes
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/  # Dashboard routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   ├── customers/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/       # Admin components
│   │   │   ├── providers/
│   │   │   ├── ui/
│   │   │   └── layouts/
│   │   ├── features/         # Feature modules
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   └── analytics/
│   │   ├── lib/              # Utilities
│   │   │   ├── api-client.ts
│   │   │   ├── store.ts
│   │   │   └── utils.ts
│   │   ├── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── storefront/           # Storefront (Port 3001)
│       ├── app/
│       │   ├── (shop)/       # Shop routes
│       │   │   ├── products/
│       │   │   ├── collections/
│       │   │   └── search/
│       │   ├── (account)/    # Account routes
│       │   │   ├── account/
│       │   │   ├── orders/
│       │   │   └── addresses/
│       │   ├── (checkout)/   # Checkout routes
│       │   │   ├── cart/
│       │   │   └── checkout/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       ├── features/
│       ├── lib/
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/                 # Shared packages
│   ├── ui/                  # UI component library
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── input/
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   └── package.json
│   ├── api-client/          # API client
│   ├── types/               # TypeScript types
│   ├── hooks/               # React hooks
│   └── utils/               # Utilities
│
├── turbo.json
├── tsconfig.json
├── .eslintrc.json
├── package.json
└── README.md
\`\`\`

## Mobile Structure

\`\`\`
mobile/
├── apps/
│   ├── merchant/             # Merchant App
│   │   ├── src/
│   │   │   ├── screens/      # Screen components
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   └── RegisterScreen.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── DashboardScreen.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── OrderListScreen.tsx
│   │   │   │   │   └── OrderDetailScreen.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── ProductListScreen.tsx
│   │   │   │   │   └── ProductFormScreen.tsx
│   │   │   │   └── settings/
│   │   │   │       └── SettingsScreen.tsx
│   │   │   ├── navigation/   # Navigation setup
│   │   │   │   ├── RootNavigator.tsx
│   │   │   │   ├── AuthNavigator.tsx
│   │   │   │   └── MainNavigator.tsx
│   │   │   ├── components/   # Shared components
│   │   │   └── features/     # Feature modules
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── App.tsx          # Entry point
│   │   ├── app.json         # Expo config
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── customer/            # Customer App
│       ├── src/
│       │   ├── screens/
│       │   │   ├── shop/
│       │   │   │   ├── HomeScreen.tsx
│       │   │   │   ├── ProductListScreen.tsx
│       │   │   │   └── ProductDetailScreen.tsx
│       │   │   ├── cart/
│       │   │   │   └── CartScreen.tsx
│       │   │   ├── checkout/
│       │   │   │   └── CheckoutScreen.tsx
│       │   │   ├── account/
│       │   │   │   ├── AccountScreen.tsx
│       │   │   │   └── OrdersScreen.tsx
│       │   │   └── auth/
│       │   ├── navigation/
│       │   ├── components/
│       │   └── features/
│       ├── assets/
│       ├── App.tsx
│       ├── app.json
│       └── package.json
│
├── packages/                # Shared packages
│   ├── ui/                 # UI components
│   ├── api/                # API client
│   ├── core/               # Core utilities
│   ├── store/              # Redux store
│   ├── hooks/              # React hooks
│   └── types/              # TypeScript types
│
├── tsconfig.json
├── .eslintrc.json
├── package.json
└── README.md
\`\`\`

## Documentation Structure

\`\`\`
docs/
├── DESIGN_DOCUMENT.md        # System architecture and design
├── requirements.md           # Software requirements specification
├── sprint-plan-backend.md    # Backend sprint plan
├── sprint-plan-web.md        # Web sprint plan
├── sprint-plan-mobile.md     # Mobile sprint plan
└── api/                      # API documentation (to be generated)
\`\`\`

## Configuration Files

### Root Level
- \`.gitignore\` - Git ignore rules
- \`README.md\` - Project overview
- \`PROJECT_STRUCTURE.md\` - This file

### Backend
- \`package.json\` - Workspace configuration
- \`turbo.json\` - Turborepo pipeline configuration
- \`tsconfig.json\` - TypeScript configuration
- \`.eslintrc.json\` - ESLint configuration
- \`.prettierrc\` - Prettier configuration
- \`docker-compose.yml\` - Docker services
- \`.env.example\` - Environment variables template

### Web
- \`package.json\` - Workspace configuration
- \`turbo.json\` - Turborepo pipeline configuration
- \`tsconfig.json\` - TypeScript configuration
- \`.eslintrc.json\` - ESLint configuration

### Mobile
- \`package.json\` - Workspace configuration
- \`tsconfig.json\` - TypeScript configuration
- \`.eslintrc.json\` - ESLint configuration

## Port Assignments

### Backend Services
- API Gateway: 3000
- Auth Service: 3001
- Store Service: 3002
- Product Service: 3003
- Order Service: 3004
- Payment Service: 3005
- Inventory Service: 3006
- Customer Service: 3007
- Analytics Service: 3008
- Notification Service: 3009
- Email Service: 3010
- Plugin Service: 3011

### Infrastructure
- PostgreSQL: 5432
- Redis: 6379
- RabbitMQ: 5672 (AMQP), 15672 (Management)
- Elasticsearch: 9200

### Web Applications
- Admin Portal: 3000 (dev)
- Storefront: 3001 (dev)

### Mobile
- Expo Dev Server: 19000-19001

## Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd Ecomify
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   cd backend
   npm install
   npm run docker:up
   cp .env.example .env
   npm run prisma:migrate
   npm run dev
   \`\`\`

3. **Web Setup**
   \`\`\`bash
   cd web
   npm install
   npm run dev
   \`\`\`

4. **Mobile Setup**
   \`\`\`bash
   cd mobile
   npm install
   npm run merchant:start
   \`\`\`

## Next Steps

After setting up the project structure:

1. Install dependencies in each workspace
2. Configure environment variables
3. Set up databases and run migrations
4. Start development servers
5. Begin implementing features according to sprint plans

---

For detailed information about each component, refer to the README files in each directory.
