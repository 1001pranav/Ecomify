# Analytics Service

Analytics service for the Ecomify platform. Collects business events, aggregates data, and provides reporting APIs.

## Features

- **Event Collection**: Captures events from all business services
- **Data Aggregation**: Daily aggregation of sales and product metrics
- **Reporting API**: Time-series reports with configurable granularity
- **Scheduled Jobs**: Automated daily aggregation

## Design Patterns

- **Observer Pattern**: Event subscribers
- **Strategy Pattern**: Aggregation strategies
- **Repository Pattern**: Data access
- **Singleton Pattern**: Database connection

## API Endpoints

### Sales Reports
```
GET /api/v1/analytics/sales
Query Parameters:
  - storeId: string (required)
  - dateFrom: ISO date (required)
  - dateTo: ISO date (required)
  - granularity: 'day' | 'week' | 'month' (optional, default: 'day')
```

### Top Products
```
GET /api/v1/analytics/products/top
Query Parameters:
  - storeId: string (required)
  - metric: 'revenue' | 'units' (required)
  - limit: number (optional, default: 10)
  - dateFrom: ISO date (optional)
  - dateTo: ISO date (optional)
```

### Customer Analytics
```
GET /api/v1/analytics/customers
Query Parameters:
  - storeId: string (required)
  - dateFrom: ISO date (optional)
  - dateTo: ISO date (optional)
```

### Manual Aggregation
```
POST /api/v1/analytics/aggregate/:storeId
Body:
  - daysBack: number (optional, default: 7)
```

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update:

```
PORT=3008
DATABASE_URL=postgresql://...
RABBITMQ_URL=amqp://...
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Scheduled Jobs

- **Daily Aggregation** (2 AM): Aggregates previous day's data for all stores
