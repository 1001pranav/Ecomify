# Customer Service

Customer management and segmentation service for the Ecomify platform.

## Features

- **Customer Management**: CRUD operations for customers
- **Address Management**: Multiple addresses per customer
- **Customer Segmentation**: Rule-based customer segments
- **Automatic Segment Updates**: Daily recalculation of segment memberships
- **Event Subscribers**: Updates customer metrics from order events

## Design Patterns

- **Repository Pattern**: Customer data access
- **Strategy Pattern**: Segmentation strategies
- **Observer Pattern**: Event subscribers

## API Endpoints

### Customer Management
```
POST   /api/v1/customers
GET    /api/v1/customers/:id
GET    /api/v1/customers?storeId=X&search=Y&tags=Z&page=1&limit=20
PATCH  /api/v1/customers/:id
DELETE /api/v1/customers/:id
```

### Address Management
```
POST   /api/v1/customers/:id/addresses
GET    /api/v1/customers/:id/addresses
PATCH  /api/v1/customers/addresses/:addressId
DELETE /api/v1/customers/addresses/:addressId
```

### Customer Segmentation
```
POST   /api/v1/segments
GET    /api/v1/segments/:id
GET    /api/v1/segments?storeId=X
PATCH  /api/v1/segments/:id
DELETE /api/v1/segments/:id
POST   /api/v1/segments/:id/refresh
GET    /api/v1/segments/:id/customers
```

## Segmentation Example

Create a VIP segment:

```json
{
  "storeId": "store123",
  "name": "VIP Customers",
  "conditions": {
    "rules": [
      {
        "field": "totalSpent",
        "operator": "greaterThan",
        "value": 1000
      },
      {
        "field": "ordersCount",
        "operator": "greaterThan",
        "value": 5
      }
    ],
    "logic": "AND"
  }
}
```

### Supported Operators
- `greaterThan`: Numeric comparison
- `lessThan`: Numeric comparison
- `equals`: Exact match
- `contains`: String/Array contains
- `in`: Value in array

### Supported Logic
- `AND`: All conditions must match
- `OR`: Any condition must match

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update:

```
PORT=3007
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

- **Segment Update** (3 AM): Recalculates all segment memberships
