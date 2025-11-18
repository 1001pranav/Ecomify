# Email Service

Transactional email service with multi-provider support and webhook tracking.

## Design Patterns Implemented

### 1. Adapter Pattern
**Location:** `src/adapters/`

Email providers are adapted to a common interface:
- `SendGridAdapter` - Adapts SendGrid API
- `SmtpAdapter` - Adapts Nodemailer SMTP

The `EmailProvider` interface defines the contract for all providers.

### 2. Factory Pattern
**Location:** `src/adapters/email-provider.factory.ts`

The `EmailProviderFactory` creates and manages email provider adapters:
- Registers all available providers
- Returns appropriate provider (SendGrid, SMTP, etc.)
- Supports default provider configuration

### 3. Strategy Pattern
**Location:** `src/adapters/`

Different email sending strategies for different providers.

### 4. Template Method Pattern
**Location:** `src/templates/template.service.ts`

Handlebars template rendering with:
- Database-stored templates
- File-based templates
- Custom helpers for formatting

## Architecture

```
┌─────────────────────────────────────┐
│      Email Controller               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Email Service                  │
│  (Orchestrates email sending)       │
└──────────┬──────────────┬───────────┘
           │              │
┌──────────▼────────┐ ┌──▼───────────┐
│ Provider Factory  │ │Template Svc  │
│ (Provider Select) │ │(Render HTML) │
└──────────┬────────┘ └──────────────┘
           │
┌──────────▼────────┐
│  Adapters         │
│ - SendGrid        │
│ - SMTP            │
└───────────────────┘
```

## API Endpoints

### Send Email
```http
POST /email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Order Confirmation",
  "html": "<h1>Thank you!</h1>",
  "text": "Thank you!",
  "options": {
    "from": "noreply@ecomify.com",
    "storeId": "store_123",
    "provider": "sendgrid"
  }
}
```

### Send from Template
```http
POST /email/send-template
Content-Type: application/json

{
  "to": "user@example.com",
  "templateSlug": "order-confirmation",
  "data": {
    "customerName": "John Doe",
    "orderNumber": "ORD-123",
    "totalPrice": 99.99,
    "currency": "USD"
  }
}
```

### Webhook (SendGrid)
```http
POST /email/webhooks/sendgrid
X-Twilio-Email-Event-Webhook-Signature: signature

[{
  "event": "delivered",
  "sg_message_id": "...",
  "timestamp": 1234567890
}]
```

## Email Tracking

The service tracks:
- ✅ **SENT** - Email sent to provider
- ✅ **DELIVERED** - Email delivered to inbox
- 📖 **OPENED** - Email opened by recipient
- 🖱️ **CLICKED** - Link clicked in email
- ❌ **BOUNCED** - Email bounced
- ❌ **FAILED** - Delivery failed

## Environment Variables

```env
PORT=3010
DATABASE_URL="postgresql://..."
DEFAULT_FROM_EMAIL=noreply@ecomify.com
DEFAULT_EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=...
SMTP_HOST=...
SMTP_PORT=587
```
