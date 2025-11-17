/**
 * Store Context Decorator - Decorator Pattern
 * Extracts store ID from request and makes it available in route handlers
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract store ID from request
 * Can be extracted from:
 * 1. X-Store-Id header
 * 2. JWT token payload
 * 3. Request params
 */
export const StoreContext = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // Try to get from header first
    let storeId = request.headers['x-store-id'];

    // If not in header, try to get from user token
    if (!storeId && request.user?.storeId) {
      storeId = request.user.storeId;
    }

    // If not in token, try to get from params
    if (!storeId && request.params?.storeId) {
      storeId = request.params.storeId;
    }

    // Store in request for middleware chain
    if (storeId) {
      request.storeId = storeId;
    }

    return storeId;
  }
);

/**
 * Decorator to extract current user from JWT
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  }
);
