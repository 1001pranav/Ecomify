# Ecomify Monitoring Stack

Comprehensive monitoring, metrics, and observability setup for Ecomify microservices.

## Stack Components

### Prometheus
- **Purpose**: Metrics collection and storage
- **Port**: 9090
- **URL**: http://localhost:9090

### Grafana
- **Purpose**: Metrics visualization and dashboards
- **Port**: 3001
- **URL**: http://localhost:3001
- **Default Credentials**: admin / admin

### Jaeger
- **Purpose**: Distributed tracing
- **UI Port**: 16686
- **URL**: http://localhost:16686
- **Collector Port**: 14268

### AlertManager
- **Purpose**: Alert management and routing
- **Port**: 9093
- **URL**: http://localhost:9093

### Node Exporter
- **Purpose**: System metrics (CPU, memory, disk)
- **Port**: 9100

### cAdvisor
- **Purpose**: Container metrics
- **Port**: 8080

## Quick Start

### 1. Start Monitoring Stack

```bash
cd backend
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Verify Services

```bash
# Check all services are running
docker-compose -f docker-compose.monitoring.yml ps

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

### 3. Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Jaeger**: http://localhost:16686
- **AlertManager**: http://localhost:9093

## Configuration

### Prometheus Configuration
File: `monitoring/prometheus/prometheus.yml`

Scrape intervals and targets for all microservices.

### Grafana Setup
Files:
- `monitoring/grafana/provisioning/datasources/prometheus.yml`
- `monitoring/grafana/provisioning/dashboards/dashboard.yml`

Grafana automatically provisions Prometheus as a data source and loads dashboards.

### Alert Rules
File: `monitoring/prometheus/alerts/service-alerts.yml`

Contains alert rules for:
- High error rates
- High response times
- Service downtime
- Resource usage
- Database performance
- Cache performance
- Business metrics

### AlertManager Configuration
File: `monitoring/alertmanager/alertmanager.yml`

Routes alerts to:
- Slack (warnings)
- PagerDuty (critical alerts)
- Webhooks (custom integrations)

## Metrics Endpoint

All services expose metrics at `/metrics`:

```bash
# Example: Get Auth Service metrics
curl http://localhost:3001/metrics
```

## Available Metrics

### HTTP Metrics
- `http_request_duration_seconds`: Request duration histogram
- `http_requests_total`: Total HTTP requests counter
- `http_connections_active`: Active connections gauge

### Database Metrics
- `db_query_duration_seconds`: Database query duration histogram

### Cache Metrics
- `cache_operations_total`: Cache operations (hit/miss/error) counter

### Queue Metrics
- `queue_depth`: Current queue depth gauge

### Event Metrics
- `event_processing_duration_seconds`: Event processing time histogram

### Business Metrics
- `orders_created_total`: Total orders created counter
- `payments_processed_total`: Total payments processed counter

## Distributed Tracing

### Setup in Service

```typescript
import { TracingMiddleware, Trace } from '@ecomify/shared/tracing';

// In main.ts
app.use(new TracingMiddleware('service-name').use);

// In service methods
@Trace('operation-name')
async myMethod() {
  // Your code
}
```

### View Traces

1. Open Jaeger UI: http://localhost:16686
2. Select service from dropdown
3. Click "Find Traces"
4. Click on a trace to see the full span tree

## Alerting

### Configure Slack Alerts

1. Create Slack webhook URL
2. Set environment variable:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   ```
3. Update `monitoring/alertmanager/alertmanager.yml`
4. Restart AlertManager

### Configure PagerDuty

1. Get PagerDuty service key
2. Set environment variable:
   ```bash
   export PAGERDUTY_SERVICE_KEY="your-service-key"
   ```
3. Update `monitoring/alertmanager/alertmanager.yml`
4. Restart AlertManager

## Query Examples

### Prometheus Queries

**Request Rate (per second):**
```promql
rate(http_requests_total[5m])
```

**95th Percentile Response Time:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Error Rate:**
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m]))
```

**Cache Hit Rate:**
```promql
sum(rate(cache_operations_total{status="hit"}[5m]))
/ sum(rate(cache_operations_total[5m]))
```

## Troubleshooting

### Prometheus Not Scraping Services

1. Check service is running: `docker ps`
2. Check service exposes `/metrics`: `curl http://service:port/metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Check Prometheus logs: `docker logs ecomify-prometheus`

### Grafana Not Showing Data

1. Check Prometheus data source: Configuration → Data Sources
2. Test connection: Click "Save & Test"
3. Check query in Explore tab
4. Verify time range in dashboard

### Alerts Not Firing

1. Check AlertManager status: http://localhost:9093
2. Check Prometheus rules: http://localhost:9090/rules
3. Check alert state: http://localhost:9090/alerts
4. Check AlertManager logs: `docker logs ecomify-alertmanager`

### Jaeger Not Showing Traces

1. Check Jaeger collector is running: `docker ps | grep jaeger`
2. Check service is sending traces (check logs)
3. Verify Jaeger endpoint in service configuration
4. Check Jaeger logs: `docker logs ecomify-jaeger`

## Production Considerations

### Retention
- **Prometheus**: Default 15 days, configure with `--storage.tsdb.retention.time`
- **Jaeger**: Default 2 days, configure with environment variables

### High Availability
- Run multiple Prometheus instances
- Use Prometheus federation
- Set up Grafana in HA mode
- Use remote storage (Thanos, Cortex)

### Security
- Enable authentication on all services
- Use TLS for communication
- Restrict access with network policies
- Implement RBAC in Grafana

### Scaling
- Use Prometheus sharding for large deployments
- Implement service discovery
- Use remote write for long-term storage
- Set up distributed tracing sampling

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)

## Support

For issues or questions:
1. Check logs: `docker-compose -f docker-compose.monitoring.yml logs`
2. Consult documentation above
3. Contact DevOps team
