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
  ProductShowAll = 'ProductShowAll',
  AddToCart = 'AddToCart',
  AddToFavorites = 'AddToFavorites',
  ViewProduct = 'ViewProduct',
}

export function showProductsNextPage(limit: number, offset: number) {
  return JSON.stringify({
    action: CallbackActionEnums.ProductShowAll,
    data: { limit, offset: offset + 10 },
  });
}

export function showProductpreviousPage(limit: number, offset: number) {
  if (offset == 0) return;
  return JSON.stringify({
    action: CallbackActionEnums.ProductShowAll,
    data: { limit, offset: offset - 10 },
  });
}

export function buildAddToCartAction(productId: string): string {
  return JSON.stringify({
    action: CallbackActionEnums.AddToCart,
    data: { productId },
  });
}

export function buildAddToFavoritesAction(productId: string): string {
  return JSON.stringify({
    action: CallbackActionEnums.AddToFavorites,
    data: { productId },
  });
}

export function buildViewProductAction(productId: string): string {
  return JSON.stringify({
    action: CallbackActionEnums.ViewProduct,
    data: { productId },
  });
}
