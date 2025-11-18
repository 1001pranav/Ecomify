# Plugin Service

Plugin marketplace with OAuth2 authentication and webhook management.

## Design Patterns Implemented

### 1. Repository Pattern
**Location:** `src/repository/`

Data access is abstracted through repositories:
- `PluginRepository` - Plugin data access
- `InstallationRepository` - Installation data access

Benefits:
- Separates business logic from data access
- Easy to test with mock repositories
- Consistent data access patterns

### 2. Factory Pattern
**Location:** `src/plugins/api-key.factory.ts`

The `ApiKeyFactory` generates secure credentials:
- API keys with prefixes
- API secrets
- OAuth2 client credentials
- HMAC signatures for webhooks

### 3. Strategy Pattern (OAuth2)
**Location:** `src/auth/oauth.service.ts`

OAuth2 authentication strategies:
- Client Credentials flow
- Refresh Token flow
- Token verification

### 4. Observer Pattern (Webhooks)
**Location:** `src/webhooks/webhook.service.ts`

Webhook system for event notifications:
- Subscribe to topics
- Automatic delivery with retry
- HMAC signature verification

## Architecture

```
┌─────────────────────────────────────┐
│   Plugins   │  OAuth   │ Webhooks   │
│ Controller  │Controller│ Controller  │
└─────┬───────┴────┬─────┴─────┬──────┘
      │            │           │
┌─────▼────┐  ┌───▼────┐  ┌───▼────┐
│ Plugins  │  │ OAuth  │  │Webhook │
│ Service  │  │Service │  │Service │
└─────┬────┘  └───┬────┘  └───┬────┘
      │           │           │
┌─────▼────┐  ┌───▼────┐  ┌───▼────┐
│Repository│  │API Key │  │API Key │
│ Pattern  │  │Factory │  │Factory │
└──────────┘  └────────┘  └────────┘
```

## Features

### 1. Plugin Management
- Create, update, delete plugins
- Plugin marketplace listing
- Installation tracking per store

### 2. OAuth2 Authentication
- Client Credentials grant type
- Access and refresh tokens
- Scope-based permissions
- Token revocation

### 3. Webhook Management
- Subscribe to event topics
- Automatic webhook delivery
- Retry logic with exponential backoff
- HMAC signature for security
- Delivery tracking and stats

## API Endpoints

### Create Plugin
```http
POST /plugins
Content-Type: application/json

{
  "name": "Inventory Sync",
  "slug": "inventory-sync",
  "description": "Sync inventory across stores",
  "version": "1.0.0",
  "author": "Acme Corp",
  "permissions": ["products:read", "products:write"],
  "webhookUrl": "https://plugin.example.com/webhooks"
}

Response:
{
  "id": "plugin_123",
  "clientId": "oauth_abc...",
  "clientSecret": "xyz..." // Only returned once!
}
```

### Install Plugin
```http
POST /plugins/install
Content-Type: application/json

{
  "storeId": "store_123",
  "pluginId": "plugin_123",
  "config": {
    "syncInterval": 3600
  }
}

Response:
{
  "id": "inst_456",
  "apiKey": "inst_abc...",
  "apiSecret": "xyz..." // Only returned once!
}
```

### OAuth2 Token
```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id=oauth_abc...&
client_secret=xyz...&
store_id=store_123&
scope=products:read products:write

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Create Webhook
```http
POST /webhooks
Content-Type: application/json

{
  "storeId": "store_123",
  "pluginId": "plugin_123",
  "topic": "orders/create",
  "address": "https://plugin.example.com/webhooks/orders"
}

Response:
{
  "id": "webhook_789",
  "secret": "whsec_..." // Save this for signature verification!
}
```

### Webhook Delivery

When an event occurs, the service sends:

```http
POST https://plugin.example.com/webhooks/orders
Content-Type: application/json
X-Webhook-Signature: 6b3a5...
X-Webhook-Topic: orders/create
X-Webhook-Id: webhook_789

{
  "event": "orders/create",
  "data": {
    "orderId": "order_123",
    "total": 99.99,
    ...
  }
}
```

**Verify signature:**
```javascript
const crypto = require('crypto');
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const secret = 'whsec_...'; // From webhook creation

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).send('Invalid signature');
}
```

## Retry Logic

Failed webhook deliveries are automatically retried:
- **Attempt 1:** Immediate
- **Attempt 2:** After 1 second
- **Attempt 3:** After 5 seconds
- **Attempt 4:** After 15 seconds

## OAuth2 Scopes

Available permission scopes:
- `products:read` - Read products
- `products:write` - Create/update products
- `orders:read` - Read orders
- `orders:write` - Update orders
- `customers:read` - Read customers
- `customers:write` - Update customers

## Environment Variables

```env
PORT=3011
DATABASE_URL="postgresql://..."
JWT_SECRET=your-secret-key
OAUTH_TOKEN_EXPIRY=3600
OAUTH_REFRESH_TOKEN_EXPIRY=2592000
```

## Security Features

1. **Client Secrets:** Hashed with SHA-256
2. **API Secrets:** Hashed with SHA-256
3. **Webhook Signatures:** HMAC-SHA256
4. **Token Expiry:** 1 hour (access), 30 days (refresh)
5. **Scope Validation:** Enforced on every request
