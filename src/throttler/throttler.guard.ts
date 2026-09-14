import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface ThrottlerEntry {
  count: number;
  resetAt: number;
}

interface ThrottleConfig {
  ttl: number;
  limit: number;
}

@Injectable()
export class ThrottlerGuard implements CanActivate {
  private readonly logger = new Logger(ThrottlerGuard.name);
  private readonly hits = new Map<string, ThrottlerEntry>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<ThrottleConfig>('throttle', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!config) return true;

    const req = context.switchToHttp().getRequest();
    const ip =
      req.ip ||
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const key = `${ip}:${context.getHandler().name}`;
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || now > entry.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + config.ttl });
      return true;
    }

    entry.count++;

    if (entry.count > config.limit) {
      this.logger.warn(`Rate limit excedido para ${ip} em ${context.getHandler().name}: ${entry.count}/${config.limit}`);
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
