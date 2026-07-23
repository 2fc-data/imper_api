import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION_KEY = 'require_permission';

/**
 * Decorator to require specific permissions for a route.
 * Usage: @RequirePermission('leads:read')
 *        @RequirePermission('leads:read', 'leads:write')
 *
 * Either @Roles() OR @RequirePermission() grants access (dual-guard).
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions);
