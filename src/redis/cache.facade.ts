import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class CacheService {
  private readonly cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300,
      checkperiod: 120,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    if (value === undefined) {
      return null;
    }
    return value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const success = this.cache.set(key, value, ttl ?? 300);
    return success;
  }

  async delete(key: string): Promise<boolean> {
    const success = this.cache.del(key);
    return success > 0;
  }

  async flush(): Promise<void> {
    this.cache.flushAll();
  }
}
