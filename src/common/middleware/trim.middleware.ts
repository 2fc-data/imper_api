import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

function trimStrings<T>(obj: T): T {
  if (typeof obj === 'string') return obj.trim() as T;
  if (Array.isArray(obj)) return obj.map(trimStrings) as T;
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    const source = obj as Record<string, unknown>;
    for (const key of Object.keys(source)) {
      result[key] = trimStrings(source[key]);
    }
    return result as T;
  }
  return obj;
}

@Injectable()
export class TrimMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = trimStrings(req.body);
    }
    next();
  }
}
