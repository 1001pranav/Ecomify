/**
 * Distributed Tracing Module with Jaeger
 * Implements distributed tracing for microservices
 *
 * Design Patterns:
 * - Singleton Pattern: Tracer instance
 * - Decorator Pattern: Method tracing
 * - Chain of Responsibility: Trace context propagation
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Trace context interface
 */
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  tags: Record<string, any>;
  logs: Array<{ timestamp: number; message: string; fields?: any }>;
}

/**
 * Tracer - Singleton Pattern
 */
export class Tracer {
  private static instance: Tracer;
  private serviceName: string;
  private jaegerEndpoint: string;
  private activeSpans: Map<string, TraceContext> = new Map();

  private constructor(serviceName: string, jaegerEndpoint: string) {
    this.serviceName = serviceName;
    this.jaegerEndpoint = jaegerEndpoint || 'http://localhost:14268/api/traces';
  }

  static getInstance(serviceName?: string, jaegerEndpoint?: string): Tracer {
    if (!Tracer.instance) {
      Tracer.instance = new Tracer(
        serviceName || 'ecomify-service',
        jaegerEndpoint || process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
      );
    }
    return Tracer.instance;
  }

  /**
   * Start a new span
   */
  startSpan(
    operationName: string,
    parentSpanId?: string,
    tags?: Record<string, any>
  ): TraceContext {
    const traceId = parentSpanId
      ? this.getTraceIdFromSpan(parentSpanId)
      : this.generateTraceId();
    const spanId = this.generateSpanId();

    const span: TraceContext = {
      traceId,
      spanId,
      parentSpanId,
      serviceName: this.serviceName,
      operationName,
      startTime: Date.now(),
      tags: tags || {},
      logs: [],
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  /**
   * Finish a span
   */
  finishSpan(spanId: string, tags?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    const duration = Date.now() - span.startTime;

    // Add final tags
    if (tags) {
      span.tags = { ...span.tags, ...tags };
    }

    // Send to Jaeger
    this.sendToJaeger({
      ...span,
      duration,
      finishTime: Date.now(),
    });

    this.activeSpans.delete(spanId);
  }

  /**
   * Add tags to span
   */
  addTags(spanId: string, tags: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags = { ...span.tags, ...tags };
    }
  }

  /**
   * Log event in span
   */
  log(spanId: string, message: string, fields?: any): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        message,
        fields,
      });
    }
  }

  /**
   * Get active span
   */
  getSpan(spanId: string): TraceContext | undefined {
    return this.activeSpans.get(spanId);
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private generateSpanId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getTraceIdFromSpan(spanId: string): string {
    const span = this.activeSpans.get(spanId);
    return span?.traceId || this.generateTraceId();
  }

  private async sendToJaeger(span: any): Promise<void> {
    try {
      // Convert to Jaeger format
      const jaegerSpan = {
        traceID: span.traceId,
        spanID: span.spanId,
        operationName: span.operationName,
        references: span.parentSpanId
          ? [
              {
                refType: 'CHILD_OF',
                traceID: span.traceId,
                spanID: span.parentSpanId,
              },
            ]
          : [],
        startTime: span.startTime * 1000, // microseconds
        duration: span.duration * 1000, // microseconds
        tags: Object.entries(span.tags).map(([key, value]) => ({
          key,
          type: typeof value,
          value,
        })),
        logs: span.logs.map((log: any) => ({
          timestamp: log.timestamp * 1000,
          fields: [
            { key: 'message', type: 'string', value: log.message },
            ...(log.fields
              ? Object.entries(log.fields).map(([key, value]) => ({
                  key,
                  type: typeof value,
                  value,
                }))
              : []),
          ],
        })),
        processID: 'p1',
        warnings: null,
      };

      // Send to Jaeger (in production, use proper HTTP client)
      console.log('[JAEGER]', JSON.stringify(jaegerSpan));

      // Actual implementation would use HTTP POST to Jaeger endpoint
      // await fetch(this.jaegerEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     data: [jaegerSpan],
      //   }),
      // });
    } catch (error) {
      console.error('Failed to send trace to Jaeger:', error);
    }
  }
}

/**
 * Trace middleware - propagates trace context
 */
@Injectable()
export class TracingMiddleware implements NestMiddleware {
  private tracer: Tracer;

  constructor(serviceName: string) {
    this.tracer = Tracer.getInstance(serviceName);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Extract parent span from headers
    const parentSpanId = req.headers['x-trace-span-id'] as string;

    // Start new span for this request
    const span = this.tracer.startSpan(
      `${req.method} ${req.path}`,
      parentSpanId,
      {
        'http.method': req.method,
        'http.url': req.url,
        'http.host': req.hostname,
        'span.kind': 'server',
      }
    );

    // Attach span to request
    (req as any).span = span;

    // Set trace headers for propagation
    res.setHeader('x-trace-id', span.traceId);
    res.setHeader('x-span-id', span.spanId);

    // Finish span when response completes
    res.on('finish', () => {
      this.tracer.finishSpan(span.spanId, {
        'http.status_code': res.statusCode,
      });
    });

    next();
  }
}

/**
 * Trace decorator for methods
 */
export function Trace(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const tracer = Tracer.getInstance();

    descriptor.value = async function (...args: any[]) {
      const opName = operationName || `${target.constructor.name}.${propertyKey}`;

      // Try to get parent span from request
      const request = args.find((arg) => arg?.span);
      const parentSpanId = request?.span?.spanId;

      const span = tracer.startSpan(opName, parentSpanId, {
        'component': target.constructor.name,
        'method': propertyKey,
      });

      try {
        const result = await originalMethod.apply(this, args);
        tracer.finishSpan(span.spanId, { 'status': 'success' });
        return result;
      } catch (error) {
        tracer.addTags(span.spanId, {
          'error': true,
          'error.message': (error as Error).message,
        });
        tracer.log(span.spanId, 'Error occurred', {
          stack: (error as Error).stack,
        });
        tracer.finishSpan(span.spanId, { 'status': 'error' });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Trace helper for manual instrumentation
 */
export class TraceHelper {
  private tracer: Tracer;

  constructor(serviceName?: string) {
    this.tracer = Tracer.getInstance(serviceName);
  }

  /**
   * Trace an async function
   */
  async traceAsync<T>(
    operationName: string,
    fn: () => Promise<T>,
    tags?: Record<string, any>
  ): Promise<T> {
    const span = this.tracer.startSpan(operationName, undefined, tags);

    try {
      const result = await fn();
      this.tracer.finishSpan(span.spanId, { status: 'success' });
      return result;
    } catch (error) {
      this.tracer.addTags(span.spanId, {
        error: true,
        'error.message': (error as Error).message,
      });
      this.tracer.finishSpan(span.spanId, { status: 'error' });
      throw error;
    }
  }

  /**
   * Get tracer instance
   */
  getTracer(): Tracer {
    return this.tracer;
  }
}
