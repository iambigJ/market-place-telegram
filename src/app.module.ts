import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GlobalConfigModule } from './common/config/config-module';
import { AllExceptionsFilter } from './common/filters/global-exeption';
import { APP_FILTER } from '@nestjs/core';
import { LoggerMiddleware } from './middleware/global-logger';
import { UsersModule } from './modules/users/users.module';
import { RedisCacheModule } from './common/cache/redis-module';
import { mongooseModule } from './common/mongose-module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    GlobalConfigModule,
    RedisCacheModule,
    mongooseModule(),
    UsersModule,
    AuthModule,
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
