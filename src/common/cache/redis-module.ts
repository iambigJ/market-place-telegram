import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { GeneralConfig } from '../../types/config.validation';
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
            host: redisConfig?.uri || 'localhost',
            port: redisConfig?.port || 6379,
          },
          password: redisConfig?.password,
        });

        return {
          store: () => store,
          isGlobal: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
