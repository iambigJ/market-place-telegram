import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GlobalConfigModule } from './common/config/config-module';
import { AllExceptionsFilter } from './filters/global-exeption';
import { APP_FILTER } from '@nestjs/core';
import { LoggerMiddleware } from './middleware/global-logger';
import { UsersModule } from './modules/users/users.module';
import { RedisCacheModule } from './common/cache/redis-module';
import { mongooseModule } from './common/mongose/mongose-module';
import { AuthModule } from './modules/auth/auth.module';
import { MyLogger } from './common/custom-logger/custom-logger';
import { OrderModule } from './modules/order/order.module';
import { CatModule } from './modules/cat/cat.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [
    GlobalConfigModule,
    RedisCacheModule,
    mongooseModule(),
    UsersModule,
    AuthModule,
    OrderModule,
    CatModule,
    CategoriesModule,
    ProductModule,
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
