/**
 * Custom decorators for API Gateway
 */

import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/jwt-auth.guard';
import { ROLES_KEY, Role } from '../guards/roles.guard';

/**
 * Public decorator - marks a route as public (no authentication required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Roles decorator - specifies required roles for a route
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
