import { Module } from '@nestjs/common';
import { UsersModule } from '../apis/users/users.module';
import { ProductModule } from '../apis/product/product.module';
import { OrderModule } from '../apis/order/order.module';
import { CategoriesModule } from '../apis/categories/categories.module';
import { FavoritesModule } from '../apis/favorites/favorites.module';
import { TelegramInit } from './core/telegram.core';
import { TelegramHandlers } from './handlers/tele-callback-handler';
import { TelegramProductHandler } from './handlers/tele-buyer-handler';
import { TelegramMenuService } from './handlers/tele-menu.handler';
import { TelegramAuthMiddleware } from './middleware/tele-auth-middleware';
import { TelegramStateMiddleware } from './middleware/tele-state.middleware';
import { TelegramSearchHandler } from './handlers/tele-search.handler';

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
