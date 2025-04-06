import { Logger } from '@nestjs/common';
import Redis from 'ioredis';

export class CacheService {
  private context: string;
  private readonly logger: Logger; // Optional logger

  constructor(private cacheManager: Redis) {
    this.logger = new Logger(CacheService.name);
  }

  setContext(context: string) {
    this.context = context;
  }

  async get(item: string): Promise<any> {
    const key = `${this.context}.${item}`;
    return await this.cacheManager.get(key).then((res) => {
      try {
        return JSON.parse(res);
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
}
