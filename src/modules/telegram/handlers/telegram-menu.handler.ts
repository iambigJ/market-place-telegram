import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import {
  buildAddToCartConfirmAction,
  showProductpreviousPage,
  showProductsNextPage,
  buildCancelOrderAction,
  buildRemoveFromFavoritesAction,
  buildShowProductsByCategoryAction,
  goToPage,
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
      await ctx.reply('شما دسترسی به این قسمت را ندارید');
      // await ctx.reply(
      //   TelegramMessages.WELCOME_SELLER,
      //   Markup.keyboard(TelegramKeyboards.SELLER_MENU).resize().oneTime(false),
      // );
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

  // New method for paginated navigation with numbered pages
  async sendNumberedPaginationButtons(
    currentPage: number,
    totalPages: number,
    limit: number,
    ctx: Context,
  ): Promise<void> {
    try {
      // Create rows of numbered buttons (3 buttons per row)
      const buttons = [];
      const row = [];

      // Previous page button if not on first page
      if (currentPage > 1) {
        row.push(
          Markup.button.callback('⬅️ قبلی', goToPage(currentPage - 1, limit)),
        );
      }

      // Current page indicator
      row.push(
        Markup.button.callback(
          `صفحه ${currentPage} از ${totalPages}`,
          'no_action', // No action needed for this button
        ),
      );

      // Next page button if not on last page
      if (currentPage < totalPages) {
        row.push(
          Markup.button.callback('بعدی ➡️', goToPage(currentPage + 1, limit)),
        );
      }

      buttons.push(row);

      // Add page number buttons (up to 5 pages)
      const pageButtons = [];
      const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
      const endPage = Math.min(startPage + 4, totalPages);

      for (let i = startPage; i <= endPage; i++) {
        const label = i === currentPage ? `• ${i} •` : `${i}`;
        pageButtons.push(
          Markup.button.callback(
            label,
            i === currentPage ? 'no_action' : goToPage(i, limit),
          ),
        );
      }

      // Split page buttons into rows of 5
      buttons.push(pageButtons);

      await ctx.reply(
        TelegramMessages.PRODUCT_MOVING_PAGES,
        Markup.inlineKeyboard(buttons),
      );
    } catch (error) {
      this.logger.error('Numbered pagination error:', error);
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

  OrderCancelInline(orderId: string): any {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.CANCEL_ORDER,
          callback_data: buildCancelOrderAction(orderId),
        },
      ],
    ]);
  }

  FavoriteRemoveInline(productId: number): any {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.REMOVE_FROM_FAVORITES,
          callback_data: buildRemoveFromFavoritesAction(productId),
        },
        {
          text: TelegramProductButtons.VIEW_PRODUCT,
          callback_data: buildViewProductAction(productId),
        },
      ],
    ]);
  }

  CategoryShowProductsInline(categoryId: string): any {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.VIEW_CATEGORY_PRODUCTS,
          callback_data: buildShowProductsByCategoryAction(categoryId),
        },
      ],
    ]);
  }
}
