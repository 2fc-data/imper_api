import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PORTAL_KEY } from '../decorators/portal.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class ClientIsolationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isPortal = this.reflector.getAllAndOverride<boolean>(IS_PORTAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPortal) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return true;
    if (user.papel !== 'CLIENTE') return true;
    throw new ForbiddenException('Acesso restrito');
  }
}
