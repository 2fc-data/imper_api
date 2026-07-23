import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

@Injectable()
export class ConfigCacheService {
  private readonly logger = new Logger(ConfigCacheService.name);
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  get(key: string): string | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: string): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.TTL_MS,
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.logger.debug('Cache cleared entirely');
      return;
    }
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.logger.debug(
      `Invalidated ${count} cache entries matching "${pattern}"`,
    );
  }
}
