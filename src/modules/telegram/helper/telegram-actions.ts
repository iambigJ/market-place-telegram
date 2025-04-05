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

export const decodeBase64UrlId = (encodedId: string): string => {
  return Buffer.from(encodedId, 'base64url').toString('ascii');
};

export const buildAddToCartAction = (encodedId: string): string => {
  const action: telegramActionType = {
    action: CallbackActionEnums.AddToCart,
    data: { productId: encodedId }
  };
  return JSON.stringify(action);
};

export const buildAddToFavoritesAction = (encodedId: string): string => {
  const action: telegramActionType = {
    action: CallbackActionEnums.AddToFavorites,
    data: { productId: encodedId }
  };
  return JSON.stringify(action);
};

export const buildViewProductAction = (encodedId: string): string => {
  const action: telegramActionType = {
    action: CallbackActionEnums.ViewProduct,
    data: { productId: encodedId }
  };
  return JSON.stringify(action);
};
