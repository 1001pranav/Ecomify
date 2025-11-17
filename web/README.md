# Ecomify Web Applications

Modern e-commerce platform frontend built with Next.js 14, React 18, and TypeScript.

## 🏗️ Architecture

- **Monorepo**: Turborepo for efficient build system
- **Admin Portal**: Merchant dashboard for store management
- **Storefront**: Customer-facing shopping experience
- **Shared Packages**: Reusable UI components and utilities

## 📦 Applications

### Admin Portal (Port 3000)
- Dashboard with analytics
- Product management
- Order processing
- Customer management
- Store settings

### Storefront (Port 3001)
- Product browsing and search
- Shopping cart
- Checkout flow
- User account
- Order tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build all apps
npm run build

# Start production servers
npm start
```

### Environment Variables

Copy `.env.example` to `.env.local` in each app:

```bash
cd apps/admin && cp .env.example .env.local
cd ../storefront && cp .env.example .env.local
```

## 🗂️ Project Structure

```
web/
├── apps/
│   ├── admin/              # Admin dashboard
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # Admin components
│   │   ├── features/       # Feature modules
│   │   └── lib/            # Utilities
│   │
│   └── storefront/         # Customer storefront
│       ├── app/
│       ├── components/
│       └── features/
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── api-client/         # API client
│   ├── types/              # TypeScript types
│   ├── hooks/              # React hooks
│   └── utils/              # Utilities
│
├── package.json
├── turbo.json
└── tsconfig.json
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **API**: Axios
- **TypeScript**: Strict mode

## 📱 Features

### Admin Portal
- ✅ Dashboard with real-time metrics
- ✅ Product catalog management
- ✅ Order processing
- ✅ Customer database
- ✅ Analytics and reports
- ✅ Store customization

### Storefront
- ✅ Product browsing and search
- ✅ Shopping cart
- ✅ Secure checkout (Stripe)
- ✅ User accounts
- ✅ Order tracking
- ✅ Responsive design

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## 🎨 Styling

This project uses Tailwind CSS with the shadcn/ui component library.

### Adding Components

```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

## 📈 Performance

- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG)
- ✅ Image Optimization
- ✅ Code Splitting
- ✅ Lazy Loading
- ✅ CDN Integration

## 🔐 Security

- ✅ JWT Authentication
- ✅ CSRF Protection
- ✅ XSS Prevention
- ✅ Input Validation
- ✅ Secure Headers

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build Docker images
docker-compose build

# Start containers
docker-compose up
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter
5. Submit a pull request

## 📝 License

MIT
