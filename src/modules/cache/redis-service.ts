import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache: Cache;
  boot(cacheInstance: Cache) {
    this.cache = cacheInstance;
  }
}
