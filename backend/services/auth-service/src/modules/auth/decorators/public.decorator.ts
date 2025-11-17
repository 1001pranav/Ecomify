/**
 * Public Decorator - Decorator Pattern
 *
 * Mark routes as public (bypass JWT authentication)
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public decorator to bypass authentication
 *
 * Usage:
 * @Public()
 * @Get('public-route')
 * publicRoute() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
