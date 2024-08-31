// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/common/cache';
// import { redisStore } from 'cache-manager-redis-store';
// import { RedisClientOptions } from 'redis';
//
// export const RedisOptions: CacheModuleAsyncOptions = {
//   isGlobal: true, // Makes the cache module global across the application
//   imports: [ConfigModule], // Import ConfigModule to access ConfigService
//   inject: [ConfigService], // Inject ConfigService to access configuration
//   useFactory: async (configService: ConfigService) => ({
//     store: redisStore,
//     host: configService.get<string>('REDIS_HOST', 'localhost'),
//     port: configService.get<number>('REDIS_PORT', 6379),
//     ttl: configService.get<number>('CACHE_TTL', 600), // Optional: Time to live
//   }),
// };

import {CacheModule, CacheModuleAsyncOptions} from '@nestjs/common/cache';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const RedisOptions: CacheModuleAsyncOptions = {
  CacheModule.registerAsync({
    isGlobal: true,
    useFactory: async () => ({
      store: await redisStore({
        socket: {
          host: 'localhost',
          port: 6379,
        },
      }),
    }),
  })
  inject: [ConfigService],
};
