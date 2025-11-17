/**
 * Current User Decorator - Decorator Pattern
 *
 * Extract current user from request
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserType {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isVerified: boolean;
}

/**
 * @CurrentUser decorator to get authenticated user
 *
 * Usage:
 * @Get('profile')
 * getProfile(@CurrentUser() user: CurrentUserType) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
