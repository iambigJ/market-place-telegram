import {Inject, Injectable, Scope} from '@nestjs/common';
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import {Cache} from 'cache-manager';

@Injectable({scope: Scope.TRANSIENT})
export class CacheService {
  private context: string;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(item: string) {
    const key = `${this.context}.${item}`;
    return await this.cacheManager.get(key).then(res => {
      try {
        return JSON.parse(res as any);
      } catch (e) {
        return res;
      }
    });
  }

  async set(item: string, value: any, ttl?: number) {
    const key = `${this.context}.${item}`;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    console.log(`string value is ${key}`)
    return await this.cacheManager.set(key, stringValue, ttl);
  }

  async getmembers(setName: string): Promise<string[]> {
    const key = `${this.context}.${setName}`;
    const members = await this.cacheManager.get(key);
    return members ? JSON.parse(members as string) : [];
  }

  async smembers(setName: string): Promise<string[]> {
    const key = `${this.context}.${setName}`;
    const members = await this.cacheManager.get(key);
    return members ? JSON.parse(members as string) : [];
  }

  async sadd(setName: string, value: string) {
    const key = `${this.context}.${setName}`;
    const currentMembers = await this.getmembers(setName);
    if (!currentMembers.includes(value)) {
      currentMembers.push(value);
      await this.set(setName, JSON.stringify(currentMembers));
    }
  }

  async delete(item: string) {
    const key = `${this.context}.${item}`;
    await this.cacheManager.del(key);
  }

  async deleteFromSet(setName: string, value: string) {
    const key = `${this.context}.${setName}`;
    const currentMembers = await this.getmembers(setName);
    const updatedMembers = currentMembers.filter(member => member !== value);
    if (updatedMembers.length > 0) {
      await this.set(setName, JSON.stringify(updatedMembers));
    } else {
      await this.delete(setName);
    }
  }

  boot(context: string) {
    this.context = context;
  }
}
