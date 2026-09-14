import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

function trimStrings(obj: any): any {
  if (typeof obj === 'string') return obj.trim();
  if (Array.isArray(obj)) return obj.map(trimStrings);
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = trimStrings(obj[key]);
    }
    return result;
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
