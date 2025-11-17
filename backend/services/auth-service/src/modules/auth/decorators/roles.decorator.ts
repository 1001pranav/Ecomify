/**
 * Roles Decorator - Decorator Pattern
 *
 * Custom decorator for specifying required roles for routes
 */

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator for role-based access control
 *
 * Usage:
 * @Roles(Role.MERCHANT, Role.PLATFORM_ADMIN)
 * @Get('protected')
 * protectedRoute() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
