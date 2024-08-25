import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GlobalConfigModule } from './shared/config-module';
import { mongooseModule } from './shared/mongose-module';
import { AllExceptionsFilter } from './exeptions/global-exeption';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { LoggerMiddleware } from './middleware/global-logger';

@Module({
  imports: [GlobalConfigModule, mongooseModule(), UsersModule],
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
