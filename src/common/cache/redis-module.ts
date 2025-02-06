import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { GeneralConfig } from '../../helper/config/config.validation';
import { CacheService } from './redis-service';

type RedisConfig = GeneralConfig['Redis_General'];

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>('Redis_General');
        const store = await redisStore({
          socket: {
            host: redisConfig?.uri,
            port: redisConfig?.port,
          },
          password: redisConfig?.password,
          ttl: 24 * 60 * 60,
        });
        return {
          store: () => store,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
