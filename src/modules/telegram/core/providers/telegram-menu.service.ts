import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import {
  CallbackActionEnums,
  showProductpreviousPage,
  showProductsNextPage,
} from '../../helper/telegram-actions';
import {
  TelegramMessages,
  TelegramKeyboards,
  TelegramProductActions,
  TelegramProductButtons,
} from '../../helper/telegram.constants';
import {
  buildAddToCartAction,
  buildAddToFavoritesAction,
  buildViewProductAction,
} from '../../helper/telegram-actions';
import mongose from 'mongoose';

@Injectable()
export class TelegramMenuService {
  private readonly logger = new Logger(TelegramMenuService.name);

  async handleMainMenu(ctx: Context) {
    try {
      await ctx.reply(
        TelegramMessages.WELCOME_MAIN,
        Markup.keyboard(TelegramKeyboards.MAIN_MENU).resize(),
      );
    } catch (error) {
      this.logger.error('Main menu error:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
    }
  }

  async handleBuyerMenu(ctx: Context) {
    try {
      await ctx.reply(
        TelegramMessages.WELCOME_BUYER,
        Markup.keyboard(TelegramKeyboards.SELLER_MENU).resize(),
      );
    } catch (error) {
      this.logger.error('Buyer menu error:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
    }
  }

  async handleSellerMenu(ctx: Context) {
    try {
      await ctx.reply(
        TelegramMessages.WELCOME_SELLER,
        Markup.keyboard(TelegramKeyboards.SELLER_MENU).resize().oneTime(false),
      );
    } catch (error) {
      this.logger.error('Seller menu error:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
    }
  }

  async sendProductPaginationButtoms(
    limit: number,
    offset: number,
    ctx: Context,
  ) {
    await ctx.reply(
      TelegramMessages.ProductMovingPages,
      Markup.inlineKeyboard([
        Markup.button.callback(
          'صفحه بعد ⬅️',
          showProductsNextPage(limit, offset),
        ),
        Markup.button.callback(
          'صفحه قبل ➡️',
          showProductpreviousPage(limit, offset),
        ),
      ]),
    );
  }

  showProductpreviousPage(limit: number, offset: number) {
    offset = Math.max(0, offset - limit);
    return JSON.stringify({
      action: CallbackActionEnums.ProductShowAll,
      data: { limit, offset },
    });
  }

  showProductsNextPage(limit: number, offset: number) {
    return JSON.stringify({
      action: CallbackActionEnums.ProductShowAll,
      data: { limit, offset: offset + limit },
    });
  }

  encodeIdToBase64Url(objectId: mongose.Types.ObjectId): string {
    const id = objectId.toString();
    return Buffer.from(id).toString('base64url');
  }

  createProductShowKeyboard(productId: string) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          TelegramProductButtons.ADD_TO_CART,
          buildAddToCartAction(productId),
        ),
        Markup.button.callback(
          TelegramProductButtons.ADD_TO_FAVORITES,
          buildAddToFavoritesAction(productId),
        ),
      ],
      [
        Markup.button.callback(
          TelegramProductButtons.VIEW_PRODUCT,
          buildViewProductAction(productId),
        ),
      ],
    ]);
  }
}
