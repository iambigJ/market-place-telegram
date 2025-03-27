import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private context: string;
  private readonly logger = new Logger(CacheService.name); // Optional logger

  constructor(@Inject(CACHE_MANAGER) public cacheManager: Cache) {}

  setContext(context: string) {
    this.context = context;
  }

  async get(item: string): Promise<any> {
    const key = `${this.context}.${item}`;
    return await this.cacheManager.get(key).then((res) => {
      try {
        return JSON.parse(res as string);
      } catch (e) {
        this.logger.error('Error parsing JSON from cache', e);
        return null;
        return res;
      }
    });
  }

  async set(item: string, value: any, ttl?: number) {
    const key = `${this.context}.${item}`;
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    return await this.cacheManager.set(key, stringValue, ttl);
  }

  async delete(item: string) {
    const key = `${this.context}.${item}`;
    await this.cacheManager.del(key);
  }

  getRedisClient() {
    try {
      console.log(this.cacheManager.stores);
      if (
        this.cacheManager.stores &&
        typeof this.cacheManager.stores['getClient'] === 'function'
      ) {
        return this.cacheManager.stores['getClient']();
      } else {
        this.logger.warn(
          'getClient() method not available on cacheManager.store.',
        );
        return null;
      }
    } catch (error) {
      this.logger.error('Error getting Redis client from cacheManager:', error); // Optional error logging
      return null;
    }
  }
}
