import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { GlobalConfigModule } from './shared/config/config-module';
import { AllExceptionsFilter } from './common/filters/global-exeption';
import { APP_FILTER } from '@nestjs/core';
import { LoggerMiddleware } from './middleware/global-logger';
import { UsersModule } from './modules/apis/users/users.module';
import { RedisCacheModule } from './common/cache/redis-module';
import { mongooseModule } from './shared/mongose/mongose-module';
import { AuthModule } from './modules/apis/auth/auth.module';

import { ProductModule } from './modules/apis/product/product.module';
import { CacheService } from './common/cache/redis-service';
import { AuthPrefix } from './common/cache/global-prefix';
import { TelegramModule } from './modules/telegram/telegram.module';
import { JWTModule } from './shared/jwt-config/jwt-module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Path to your static files
      serveRoot: '/static',  // Optional: URL prefix (e.g., /static/image.jpg)
      // Other options (see below)
  }),
    GlobalConfigModule,
    JWTModule,
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
