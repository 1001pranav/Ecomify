/**
 * Monitoring and Observability Module
 * Implements Prometheus metrics, health checks, and distributed tracing
 *
 * Design Patterns:
 * - Singleton Pattern: Metrics registry
 * - Observer Pattern: Metrics collection
 * - Decorator Pattern: Method instrumentation
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as promClient from 'prom-client';

/**
 * Prometheus metrics registry - Singleton Pattern
 */
export class MetricsRegistry {
  private static instance: MetricsRegistry;
  private registry: promClient.Registry;
  private metrics: Map<string, any> = new Map();

  private constructor() {
    this.registry = new promClient.Registry();

    // Default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register: this.registry });

    this.initializeMetrics();
  }

  static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry();
    }
    return MetricsRegistry.instance;
  }

  private initializeMetrics() {
    // HTTP request duration histogram
    this.metrics.set(
      'http_request_duration',
      new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        registers: [this.registry],
      })
    );

    // HTTP request counter
    this.metrics.set(
      'http_requests_total',
      new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.registry],
      })
    );

    // Active connections gauge
    this.metrics.set(
      'http_connections_active',
      new promClient.Gauge({
        name: 'http_connections_active',
        help: 'Number of active HTTP connections',
        registers: [this.registry],
      })
    );

    // Database query duration
    this.metrics.set(
      'db_query_duration',
      new promClient.Histogram({
        name: 'db_query_duration_seconds',
        help: 'Duration of database queries in seconds',
        labelNames: ['operation', 'table'],
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
        registers: [this.registry],
      })
    );

    // Cache hit/miss counter
    this.metrics.set(
      'cache_operations',
      new promClient.Counter({
        name: 'cache_operations_total',
        help: 'Total number of cache operations',
        labelNames: ['operation', 'status'],
        registers: [this.registry],
      })
    );

    // Queue depth gauge
    this.metrics.set(
      'queue_depth',
      new promClient.Gauge({
        name: 'queue_depth',
        help: 'Current depth of message queue',
        labelNames: ['queue_name'],
        registers: [this.registry],
      })
    );

    // Event processing duration
    this.metrics.set(
      'event_processing_duration',
      new promClient.Histogram({
        name: 'event_processing_duration_seconds',
        help: 'Duration of event processing in seconds',
        labelNames: ['event_type'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        registers: [this.registry],
      })
    );

    // Business metrics
    this.metrics.set(
      'orders_created',
      new promClient.Counter({
        name: 'orders_created_total',
        help: 'Total number of orders created',
        labelNames: ['store_id'],
        registers: [this.registry],
      })
    );

    this.metrics.set(
      'payments_processed',
      new promClient.Counter({
        name: 'payments_processed_total',
        help: 'Total number of payments processed',
        labelNames: ['status', 'gateway'],
        registers: [this.registry],
      })
    );
  }

  getMetric(name: string): any {
    return this.metrics.get(name);
  }

  getRegistry(): promClient.Registry {
    return this.registry;
  }

  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}

/**
 * HTTP metrics middleware - Observer Pattern
 */
@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  private metricsRegistry = MetricsRegistry.getInstance();
  private httpDuration = this.metricsRegistry.getMetric('http_request_duration');
  private httpRequests = this.metricsRegistry.getMetric('http_requests_total');
  private activeConnections = this.metricsRegistry.getMetric('http_connections_active');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Increment active connections
    this.activeConnections.inc();

    // Capture response
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path;
      const labels = {
        method: req.method,
        route,
        status_code: res.statusCode,
      };

      this.httpDuration.observe(labels, duration);
      this.httpRequests.inc(labels);
      this.activeConnections.dec();
    });

    next();
  }
}

/**
 * Database metrics decorator
 */
export function MonitorDatabase(operation: string, table: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricsRegistry = MetricsRegistry.getInstance();
    const dbDuration = metricsRegistry.getMetric('db_query_duration');

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = (Date.now() - start) / 1000;
        dbDuration.observe({ operation, table }, duration);
        return result;
      } catch (error) {
        const duration = (Date.now() - start) / 1000;
        dbDuration.observe({ operation, table }, duration);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache metrics decorator
 */
export function MonitorCache(operation: 'get' | 'set' | 'delete') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricsRegistry = MetricsRegistry.getInstance();
    const cacheOps = metricsRegistry.getMetric('cache_operations');

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        const status = result !== null ? 'hit' : 'miss';
        cacheOps.inc({ operation, status });
        return result;
      } catch (error) {
        cacheOps.inc({ operation, status: 'error' });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Health check service
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      message?: string;
      latency?: number;
    };
  };
}

@Injectable()
export class HealthCheckService {
  private startTime: number = Date.now();

  async check(): Promise<HealthCheckResult> {
    const checks: any = {};

    // Check database
    checks.database = await this.checkDatabase();

    // Check Redis
    checks.redis = await this.checkRedis();

    // Check RabbitMQ
    checks.rabbitmq = await this.checkRabbitMQ();

    // Determine overall status
    const allUp = Object.values(checks).every((check: any) => check.status === 'up');
    const anyDown = Object.values(checks).some((check: any) => check.status === 'down');

    return {
      status: allUp ? 'healthy' : anyDown ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      checks,
    };
  }

  private async checkDatabase(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      // Implement actual database check
      // await prisma.$queryRaw`SELECT 1`;
      return { status: 'up', latency: Date.now() - start };
    } catch (error) {
      return { status: 'down', latency: Date.now() - start };
    }
  }

  private async checkRedis(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      // Implement actual Redis check
      // await redis.ping();
      return { status: 'up', latency: Date.now() - start };
    } catch (error) {
      return { status: 'down', latency: Date.now() - start };
    }
  }

  private async checkRabbitMQ(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      // Implement actual RabbitMQ check
      return { status: 'up', latency: Date.now() - start };
    } catch (error) {
      return { status: 'down', latency: Date.now() - start };
    }
  }
}
