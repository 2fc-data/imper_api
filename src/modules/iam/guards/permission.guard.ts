import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator.js';
import { ROLES_KEY } from '../../../modules/auth/decorators/roles.decorator.js';
import { UserRole } from '../../../common/enums/user-role.enum.js';

interface GuardUser {
  id?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
}

interface RequestWithUser {
  user?: GuardUser;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      (!requiredPermissions || requiredPermissions.length === 0) &&
      (!requiredRoles || requiredRoles.length === 0)
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false;
    }

    let hasRoleAccess = false;
    let hasPermissionAccess = false;

    if (requiredRoles && requiredRoles.length > 0) {
      hasRoleAccess = requiredRoles.some(
        (role) => user.role === role || user.roles?.includes(role),
      );
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions: string[] = user.permissions || [];
      hasPermissionAccess = requiredPermissions.some((perm) =>
        userPermissions.includes(perm),
      );
    }

    const allowed = hasRoleAccess || hasPermissionAccess;

    if (!allowed) {
      this.logger.warn(
        `User ${user.id} denied access: roles=${JSON.stringify(requiredRoles)}, perms=${JSON.stringify(requiredPermissions)}`,
      );
    }

    return allowed;
  }
}
