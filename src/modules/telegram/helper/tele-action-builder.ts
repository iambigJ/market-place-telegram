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
  ShowUserOrders = 'show_user_orders',
  CancelOrder = 'cancel_order',
  RemoveFromFavorites = 'remove_from_favorites',
  ShowUserFavorites = 'show_user_favorites',
  ShowCategory = 'show_category',
  ShowProductsByCategory = 'show_products_by_category',
  GoToPage = 'go_to_page',
}

export interface TelegramActionData {
  action: CallbackActionEnums;
  productId?: number;
  orderId?: string;
  favoriteId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  offset?: number;
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

export const goToPage = (page: number, limit: number): string => {
  const offset = (page - 1) * limit;
  return JSON.stringify({
    action: CallbackActionEnums.GoToPage,
    limit,
    page,
    offset,
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

export const buildCancelOrderAction = (orderId: string): string => {
  return JSON.stringify({
    action: CallbackActionEnums.CancelOrder,
    orderId,
  });
};

export const buildRemoveFromFavoritesAction = (productId: number): string => {
  return JSON.stringify({
    action: CallbackActionEnums.RemoveFromFavorites,
    productId,
  });
};

export const buildShowCategoryAction = (): string => {
  return JSON.stringify({
    action: CallbackActionEnums.ShowCategory,
  });
};

export const buildShowProductsByCategoryAction = (
  categoryId: string,
): string => {
  console.log('buildShowProductsByCategoryAction', categoryId);
  return JSON.stringify({
    action: CallbackActionEnums.ShowProductsByCategory,
    categoryId,
  });
};
