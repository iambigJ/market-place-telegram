import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';
import { CacheService } from '../cache/redis-service';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/common/cache';
import { RedisOptions } from '../cache/redis-module';

@Module({
  imports: [],
  providers: [UserRepository, CacheService],
  controllers: [UsersController],
})
export class UsersModule implements OnModuleInit {
  constructor(private cacheSerivce: CacheService) {}

  onModuleInit(): void {
    // this.cacheSerivce.boot(this.cacheManager);
  }
}
