import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { GlobalConfigModule } from './helper/config/config-module';
import { AllExceptionsFilter } from './common/filters/global-exeption';
import { APP_FILTER } from '@nestjs/core';
import { LoggerMiddleware } from './middleware/global-logger';
import { UsersModule } from './modules/apis/users/users.module';
import { RedisCacheModule } from './common/cache/redis-module';
import { mongooseModule } from './helper/mongose/mongose-module';
import { AuthModule } from './modules/apis/auth/auth.module';

import { ProductModule } from './modules/apis/product/product.module';
import { CacheService } from './common/cache/redis-service';
import { AuthPrefix } from './helper/prefixes/global-prefix';
import { TelegramModule } from './modules/telegram/telegram.module';

@Module({
  imports: [
    GlobalConfigModule,
    RedisCacheModule,
    mongooseModule(),
    UsersModule,
    AuthModule,
    ProductModule,
    TelegramModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private cache: CacheService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
  onModuleInit() {
    this.cache.setContext(AuthPrefix);
  }
}
