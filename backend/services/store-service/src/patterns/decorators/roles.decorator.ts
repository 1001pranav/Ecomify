/**
 * Roles Decorator - Decorator Pattern
 * Marks routes with required roles for authorization
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export enum Role {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  MERCHANT = 'MERCHANT',
  STORE_STAFF = 'STORE_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
