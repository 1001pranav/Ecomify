# Notification Service

Multi-channel notification service with support for Email, SMS, and Push notifications.

## Design Patterns Implemented

### 1. Strategy Pattern
**Location:** `src/strategies/`

Different notification delivery channels (Email, SMS, Push) are implemented as strategies:
- `EmailNotificationStrategy` - Delegates to Email Service
- `SmsNotificationStrategy` - Uses Twilio for SMS
- `PushNotificationStrategy` - Uses Firebase for push notifications

Each strategy implements the `NotificationStrategy` interface.

### 2. Factory Pattern
**Location:** `src/strategies/notification-strategy.factory.ts`

The `NotificationStrategyFactory` creates and manages notification strategies:
- Registers all available strategies
- Returns appropriate strategy based on channel name
- Provides list of supported channels

### 3. Template Method Pattern
**Location:** `src/templates/`

The `HandlebarsTemplateRenderer` implements template rendering with Handlebars:
- Custom helpers for date and currency formatting
- Reusable template compilation
- Consistent rendering interface

### 4. Observer Pattern
**Location:** `src/events/event-subscribers.service.ts`

Event subscribers listen to business events from other services:
- Subscribes to order, payment, and user events
- Automatically triggers notifications based on events
- Decoupled from other services

## Architecture

```
┌─────────────────────────────────────┐
│    Notification Controller          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Notifications Service            │
│  (Orchestrates notification flow)   │
└──────────┬──────────────┬───────────┘
           │              │
┌──────────▼────────┐ ┌──▼───────────┐
│ Strategy Factory  │ │Template Svc  │
│ (Channel Selection)│ │(Render msgs) │
└──────────┬────────┘ └──────────────┘
           │
┌──────────▼────────┐
│  Strategies       │
│ - Email           │
│ - SMS             │
│ - Push            │
└───────────────────┘
```

## API Endpoints

### Send Notification
```http
POST /notifications/send
Content-Type: application/json

{
  "channel": "email",
  "recipient": "user@example.com",
  "event": "order.created",
  "data": {
    "customerName": "John Doe",
    "orderNumber": "ORD-123",
    "totalPrice": 99.99
  },
  "options": {
    "userId": "user_123",
    "storeId": "store_456"
  }
}
```

### Send Multi-Channel
```http
POST /notifications/send-multi
Content-Type: application/json

{
  "channels": ["email", "sms"],
  "recipient": "user@example.com",
  "event": "order.shipped",
  "data": { ... }
}
```

## Environment Variables

```env
PORT=3009
DATABASE_URL="postgresql://..."
FIREBASE_PROJECT_ID=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

## Event Topics

Supported event topics:
- `order.created` - Order confirmation
- `order.shipped` - Shipping notification
- `payment.success` - Payment confirmation
- `user.registered` - Welcome email
- `password.reset` - Password reset
- `inventory.low_stock` - Low stock alert
