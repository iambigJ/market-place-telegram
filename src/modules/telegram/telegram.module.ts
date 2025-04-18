import { Module } from '@nestjs/common';
import { UsersModule } from '../apis/users/users.module';
import { ProductModule } from '../apis/product/product.module';
import { OrderModule } from '../apis/order/order.module';
import { CategoriesModule } from '../apis/categories/categories.module';
import { FavoritesModule } from '../apis/favorites/favorites.module';
import { TelegramInit } from './core/telegram.core';
import { TelegramHandlers } from './core/telegram-main.handler';
import { TelegramProductHandler } from './handlers/telegram-seller.handler';
import { TelegramMenuService } from './handlers/telegram-menu.handler';
import { TelegramAuthMiddleware } from './handlers/telegram-auth-middleware';
import { TelegramStateMiddleware } from './handlers/telegram-state.middleware';
import { TelegramSearchHandler } from './handlers/telegram-search.handler';

@Module({
  imports: [
    UsersModule,
    ProductModule,
    OrderModule,
    CategoriesModule,
    FavoritesModule,
  ],
  providers: [
    TelegramInit,
    TelegramHandlers,
    TelegramProductHandler,
    TelegramMenuService,
    TelegramAuthMiddleware,
    TelegramStateMiddleware,
    TelegramSearchHandler,
  ],
  exports: [TelegramInit],
})
export class TelegramModule {}
