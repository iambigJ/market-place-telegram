import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import {
  buildAddToCartConfirmAction,
  showProductpreviousPage,
  showProductsNextPage,
} from '../helper/telegram-actions';
import {
  TelegramMessages,
  TelegramKeyboards,
  TelegramProductButtons,
} from '../helper/telegram.constants';
import {
  buildAddToCartAction,
  buildAddToFavoritesAction,
  buildViewProductAction,
  buildAddToCartConfirmCancelAction,
} from '../helper/telegram-actions';
import mongoose from 'mongoose';
import { ITelegramMenuService } from '../interfaces/telegram.interface';

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

  encodeIdToBase64Url(objectId: mongoose.Types.ObjectId): string {
    const id = objectId.toString();
    return Buffer.from(id).toString('base64url');
  }

  ProductShowInline(productId: number): any {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.ADD_TO_CART,
          callback_data: buildAddToCartAction(productId),
        },
        {
          text: TelegramProductButtons.ADD_TO_FAVORITES,
          callback_data: buildAddToFavoritesAction(productId),
        },
      ],
      [
        {
          text: TelegramProductButtons.VIEW_PRODUCT,
          callback_data: buildViewProductAction(productId),
        },
      ],
    ]);
  }

  ProductFullShowInline(productId: number): any {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.ADD_TO_CART,
          callback_data: buildAddToCartAction(productId),
        },
        {
          text: TelegramProductButtons.ADD_TO_FAVORITES,
          callback_data: buildAddToFavoritesAction(productId),
        },
      ],
    ]);
  }

  ProductAddToCartInline(productId: number): any {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.ADD_TO_CART_CONFIRM,
          callback_data: buildAddToCartConfirmAction(productId),
        },
        {
          text: TelegramProductButtons.ADD_TO_CART_CONFIRM_CANCEL,
          callback_data: buildAddToCartConfirmCancelAction(productId),
        },
      ],
    ]);
  }
}
