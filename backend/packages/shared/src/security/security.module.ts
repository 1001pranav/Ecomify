/**
 * Security Module - Security Hardening
 * Implements rate limiting, input validation, CSRF protection
 *
 * Design Patterns:
 * - Chain of Responsibility: Security middleware chain
 * - Decorator Pattern: Security decorators
 * - Strategy Pattern: Different security strategies
 */

import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';

/**
 * Rate limiting strategy interface - Strategy Pattern
 */
export interface RateLimitStrategy {
  windowMs: number;
  max: number;
  message: string;
}

/**
 * Rate limit strategies for different endpoints
 */
export const RateLimitStrategies = {
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'API rate limit exceeded.',
  },
  strict: {
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: 'Rate limit exceeded for this operation.',
  },
};

/**
 * Create rate limiter with strategy
 */
export function createRateLimiter(strategy: RateLimitStrategy) {
  return rateLimit({
    windowMs: strategy.windowMs,
    max: strategy.max,
    message: strategy.message,
    standardHeaders: true,
    legacyHeaders: false,
    // Store in Redis for distributed systems
    // store: new RedisStore({ client: redisClient }),
  });
}

/**
 * Security headers middleware
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use helmet for security headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })(req, res, next);
  }
}

/**
 * Input validation utilities
 */
export class InputValidator {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Prevent SQL injection by validating input
   */
  static containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b)/i,
      /(\bUNION\b|\bJOIN\b)/i,
      /(--|;|\/\*|\*\/)/,
      /(\bOR\b|\bAND\b).*?=.*?/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Validate and sanitize user input
   */
  static validateAndSanitize(input: any): any {
    if (typeof input === 'string') {
      if (this.containsSqlInjection(input)) {
        throw new HttpException(
          'Invalid input detected',
          HttpStatus.BAD_REQUEST
        );
      }
      return this.sanitizeString(input);
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = Array.isArray(input) ? [] : {};
      for (const key in input) {
        sanitized[key] = this.validateAndSanitize(input[key]);
      }
      return sanitized;
    }

    return input;
  }
}

/**
 * CSRF Protection
 */
@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Check CSRF token
    const token = req.headers['x-csrf-token'] as string;
    const cookieToken = req.cookies?.['csrf-token'];

    if (!token || token !== cookieToken) {
      throw new HttpException('Invalid CSRF token', HttpStatus.FORBIDDEN);
    }

    next();
  }
}

/**
 * API Key validation middleware
 */
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new HttpException('API key required', HttpStatus.UNAUTHORIZED);
    }

    // Validate API key (implement actual validation logic)
    // This is a placeholder
    const isValid = this.validateApiKey(apiKey);

    if (!isValid) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }

    next();
  }

  private validateApiKey(apiKey: string): boolean {
    // Implement actual API key validation
    // Check against database or cache
    return true;
  }
}

/**
 * Request sanitization middleware - Chain of Responsibility
 */
@Injectable()
export class RequestSanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Sanitize body
      if (req.body) {
        req.body = InputValidator.validateAndSanitize(req.body);
      }

      // Sanitize query params
      if (req.query) {
        req.query = InputValidator.validateAndSanitize(req.query);
      }

      next();
    } catch (error) {
      throw new HttpException(
        'Invalid input detected',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

/**
 * Audit logging for sensitive operations
 */
export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: any;
}

@Injectable()
export class AuditLogger {
  private logs: AuditLog[] = [];

  log(auditLog: AuditLog): void {
    this.logs.push(auditLog);
    // In production, send to logging service (ELK, CloudWatch, etc.)
    console.log('[AUDIT]', JSON.stringify(auditLog));
  }

  getLogs(): AuditLog[] {
    return this.logs;
  }
}

/**
 * Audit decorator for sensitive operations
 */
export function Audit(action: string, resource: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const auditLogger: AuditLogger = this.auditLogger;
      const request = args.find((arg) => arg?.user);

      if (auditLogger && request) {
        auditLogger.log({
          userId: request.user?.id || 'anonymous',
          action,
          resource,
          timestamp: new Date(),
          ipAddress: request.ip,
          userAgent: request.headers?.['user-agent'] || 'unknown',
          details: args,
        });
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
