import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GlobalConfigModule } from './shared/config-module';
import { AllExceptionsFilter } from './exeptions/global-exeption';
import { APP_FILTER } from '@nestjs/core';
import { LoggerMiddleware } from './middleware/global-logger';
import { UsersModule } from './modules/users/users.module';
import {RedisCacheModule} from "./modules/cache/redis-module";


@Module({
  imports: [
    GlobalConfigModule,
    // mongooseModule(),
    RedisCacheModule,
    // CacheModule.register(RedisOptions),
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
