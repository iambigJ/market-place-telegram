import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GlobalConfigModule } from './shared/config-module';
import { AllExceptionsFilter } from './exeptions/global-exeption';
import { APP_FILTER } from '@nestjs/core';
import { LoggerMiddleware } from './middleware/global-logger';
import { UsersModule } from './modules/users/users.module';
import { CacheModule } from '@nestjs/common/cache';
import { ConfigService } from '@nestjs/config';
import { Config } from './types/config.validation';
import { RedisOptions } from './modules/cache/redis-module';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    GlobalConfigModule,
    // mongooseModule(),
,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
