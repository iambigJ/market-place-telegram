export type telegramActionType = {
  action: CallbackActionEnums;
  data: {
    productId?: string;
    limit?: number;
    offset?: number;
    [other: string]: any;
  };
};

export enum CallbackActionEnums {
  ProductShowAll = 'product_show_all',
  ViewProduct = 'view_product',
  AddToCart = 'add_to_cart',
  AddToFavorites = 'add_to_favorites',
  AddToCartConfirm = 'add_to_cart_confirm',
  AddToCartConfirmCancel = 'add_to_cart_confirm_cancel',
}

export interface TelegramActionData {
  action: CallbackActionEnums;
  productId: number;
}

export interface TelegramPaginationData {
  action: CallbackActionEnums;
  data: {
    limit: number;
    offset: number;
  };
}

export const showProductsNextPage = (limit: number, offset: number): string => {
  return JSON.stringify({
    action: CallbackActionEnums.ProductShowAll,
    data: { limit, offset: offset + limit },
  });
};

export const showProductpreviousPage = (
  limit: number,
  offset: number,
): string => {
  offset = Math.max(0, offset - limit);
  return JSON.stringify({
    action: CallbackActionEnums.ProductShowAll,
    data: { limit, offset },
  });
};

export const decodeBase64UrlId = (encodedId: string): string => {
  return Buffer.from(encodedId, 'base64url').toString('ascii');
};

export const buildViewProductAction = (productId: number): string => {
  return JSON.stringify({
    action: CallbackActionEnums.ViewProduct,
    productId,
  });
};

export const buildAddToCartAction = (productId: number): string => {
  return JSON.stringify({
    action: CallbackActionEnums.AddToCart,
    productId,
  });
};

export const buildAddToFavoritesAction = (productId: number): string => {
  return JSON.stringify({
    action: CallbackActionEnums.AddToFavorites,
    productId,
  });
};

export const buildAddToCartConfirmAction = (productId: number): string => {
  return JSON.stringify({
    action: CallbackActionEnums.AddToCartConfirm,
    productId,
  });
};

export const buildAddToCartConfirmCancelAction = (
  productId: number,
): string => {
  return JSON.stringify({
    action: CallbackActionEnums.AddToCartConfirmCancel,
    productId,
  });
};
