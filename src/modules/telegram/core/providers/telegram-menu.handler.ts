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
  TelegramProductButtons,
} from '../../helper/telegram.constants';
import {
  buildAddToCartAction,
  buildAddToFavoritesAction,
  buildViewProductAction,
} from '../../helper/telegram-actions';
import mongose from 'mongoose';
import { ITelegramMenuService } from '../../interfaces/telegram.interface';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class TelegramMenuService implements ITelegramMenuService {
  private readonly logger = new Logger(TelegramMenuService.name);

  async sendMainMenuKeyboard(ctx: Context): Promise<void> {
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

  async sendBuyerMenuKeyboard(ctx: Context): Promise<void> {
    try {
      await ctx.reply(
        TelegramMessages.WELCOME_BUYER,
        Markup.keyboard(TelegramKeyboards.BUYER_MENU).resize(),
      );
    } catch (error) {
      this.logger.error('Buyer menu error:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
    }
  }

  async sendSellerMenuKeyboard(ctx: Context): Promise<void> {
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
    offset: number,
    limit: number,
    ctx: Context,
  ): Promise<void> {
    try {
      await ctx.reply(
        TelegramMessages.PRODUCT_MOVING_PAGES,
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
    } catch (error) {
      this.logger.error('Product pagination error:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
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

  ProductShowInline(productId: string): any {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.ADD_TO_CART,
          callback_data: buildAddToCartAction(productId.toString()),
        },
        {
          text: TelegramProductButtons.ADD_TO_FAVORITES,
          callback_data: buildAddToFavoritesAction(productId.toString()),
        },
      ],
      [
        {
          text: TelegramProductButtons.VIEW_PRODUCT,
          callback_data: buildViewProductAction(productId.toString()),
        },
      ],
    ]);
  }
}
