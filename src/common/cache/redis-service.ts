import { Inject, Injectable, Scope } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-yet';

@Injectable()
export class CacheService {
  private context: string;
  private clinet: RedisStore;
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(item: string) {
    const key = `${this.context}.${item}`;
    return await this.cacheManager.get(key).then((res) => {
      try {
        return JSON.parse(res as any);
      } catch (e) {
        return res;
      }
    });
  }

  async set(item: string, value: any, ttl?: number) {
    const key = `${this.context}.${item}`;
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    console.log(`string value is ${key}`);
    return await this.cacheManager.set(key, stringValue, ttl);
  }

  async delete(item: string) {
    const key = `${this.context}.${item}`;
    await this.cacheManager.del(key);
  }

}
