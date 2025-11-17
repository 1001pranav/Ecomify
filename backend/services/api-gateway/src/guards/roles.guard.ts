/**
 * Roles Guard
 * Implements role-based access control
 * Implements Guard and Strategy patterns
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

export enum Role {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  MERCHANT = 'MERCHANT',
  STORE_STAFF = 'STORE_STAFF',
  CUSTOMER = 'CUSTOMER',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
