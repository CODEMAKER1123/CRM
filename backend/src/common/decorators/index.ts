import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract tenant ID from request headers
 * Usage: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-tenant-id'] || request.user?.tenantId;
  },
);

/**
 * Custom decorator to extract user ID from authenticated request
 * Usage: @UserId() userId: string
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id || request.headers['x-user-id'];
  },
);

/**
 * Custom decorator to extract entire user object from authenticated request
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
