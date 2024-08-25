export class CacheService {
  prefix: string;
  constructor() {}
  boot(prefix: string) {}
  // Set a value in the cache
  async set(key: string, value: any, expire?: number): Promise<void> {
    const prefixedKey = this.prefix ? `${this.prefix}:${key}` : key;
    if (expire) {
      await this.redisClient.set(
        prefixedKey,
        JSON.stringify(value),
        'EX',
        expire,
      );
    } else {
      await this.redisClient.set(prefixedKey, JSON.stringify(value));
    }
  }

  // Get a value from the cache
  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = this.prefix ? `${this.prefix}:${key}` : key;
    const value = await this.redisClient.get(prefixedKey);
    return value ? JSON.parse(value) : null;
  }

  // Optionally, add a method to delete keys
  async del(key: string): Promise<void> {
    const prefixedKey = this.prefix ? `${this.prefix}:${key}` : key;
    await this.redisClient.del(prefixedKey);
  }
}
