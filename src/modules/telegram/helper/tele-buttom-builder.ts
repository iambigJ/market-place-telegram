import { Markup } from 'telegraf';
import {
  buildAddToCartAction,
  buildAddToFavoritesAction,
  buildViewProductAction,
  buildAddToCartConfirmAction,
  buildAddToCartConfirmCancelAction,
  buildCancelOrderAction,
  buildRemoveFromFavoritesAction,
  buildShowProductsByCategoryAction,
} from './tele-action-builder';
import { TelegramProductButtons } from './tele-constants';

export class ButtonBuilder {
  static productShowInline(productId: number) {
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

  static productFullShowInline(productId: number) {
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

  static productAddToCartInline(productId: number) {
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

  static orderCancelInline(orderId: string) {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.CANCEL_ORDER,
          callback_data: buildCancelOrderAction(orderId),
        },
      ],
    ]);
  }

  static favoriteRemoveInline(productId: number) {
    return Markup.inlineKeyboard([
      [
        {
          text: TelegramProductButtons.REMOVE_FROM_FAVORITES,
          callback_data: buildRemoveFromFavoritesAction(productId),
        },
      ],
    ]);
  }

  static categoryShowProductsInline(categoryId: string) {
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
