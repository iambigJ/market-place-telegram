import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private context: string;
  private readonly logger = new Logger(CacheService.name); // Optional logger

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  setContext(context: string) {
    this.context = context;
  }

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
    return await this.cacheManager.set(key, stringValue, ttl);
  }

  async delete(item: string) {
    const key = `${this.context}.${item}`;
    await this.cacheManager.del(key);
  }

  async hset(item: string, field: string, value: any): Promise<void> {
    const key = `${this.context}.${item}`;
    const redisClient = this.getRedisClient();

    if (!redisClient) {
      this.logger.error('Redis client is not available.');
      throw new Error('Redis client is not available.');
    }

    const stringValue = String(value);
    try {
      await redisClient.hset(key, field, stringValue);
    } catch (error) {
      this.logger.error(
        `Error during HSET for key: ${key}, field: ${field}`,
        error,
      );
      throw new Error(`Failed to HSET field in cache: ${error.message}`);
    }
  }

  private getRedisClient() {
    try {
      if (
        this.cacheManager.store &&
        typeof this.cacheManager.store['getClient'] === 'function'
      ) {
        return this.cacheManager.store['getClient']();
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
