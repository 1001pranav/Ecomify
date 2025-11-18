# Load Testing with k6

This directory contains load tests for the Ecomify backend microservices.

## Prerequisites

Install k6:
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6
```

## Running Load Tests

### Basic Load Test
```bash
k6 run k6-load-test.js
```

### With Custom Configuration
```bash
# Set API Gateway URL
API_GATEWAY_URL=http://localhost:3000 k6 run k6-load-test.js

# Run with specific VUs and duration
k6 run --vus 100 --duration 5m k6-load-test.js

# Generate HTML report
k6 run --out json=results.json k6-load-test.js
```

### Load Test Scenarios

1. **Smoke Test** (Minimal load)
   ```bash
   k6 run --vus 1 --duration 1m k6-load-test.js
   ```

2. **Average Load**
   ```bash
   k6 run --vus 100 --duration 10m k6-load-test.js
   ```

3. **Stress Test** (High load)
   ```bash
   k6 run --vus 1000 --duration 10m k6-load-test.js
   ```

4. **Spike Test** (Sudden load increase)
   ```bash
   k6 run --stage 0s:100,10s:1000,1m:1000,10s:100 k6-load-test.js
   ```

## Performance Targets

Based on Sprint 8 requirements:

- **Response Time**: p95 < 200ms
- **Error Rate**: < 1%
- **Throughput**: 1000 req/s
- **Database Queries**: p95 < 50ms
- **Cache Hit Ratio**: > 70%

## Metrics Collected

- `http_req_duration`: HTTP request duration
- `http_req_failed`: Failed HTTP requests
- `errors`: Custom error rate
- `response_time`: Custom response time trend

## Interpreting Results

Good performance indicators:
- ✅ p95 response time < 200ms
- ✅ Error rate < 1%
- ✅ All requests completed successfully
- ✅ No timeouts

Warning signs:
- ⚠️ p95 response time > 200ms
- ⚠️ Error rate > 1%
- ⚠️ Increasing response times over test duration

Critical issues:
- ❌ p95 response time > 500ms
- ❌ Error rate > 5%
- ❌ Timeouts or connection errors
- ❌ Memory leaks (increasing response time over duration)
