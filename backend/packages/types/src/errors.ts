/**
 * Custom error types for Ecomify microservices
 */

export class BaseError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, identifier?: string) {
    super(
      'NOT_FOUND',
      identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`,
      404,
    );
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized access') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Forbidden access') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, details?: any) {
    super('CONFLICT', message, 409, details);
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string = 'Internal server error', details?: any) {
    super('INTERNAL_SERVER_ERROR', message, 500, details);
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(service: string) {
    super('SERVICE_UNAVAILABLE', `${service} is currently unavailable`, 503);
  }
}
