import { off } from 'process';

export type telegramActionType = {
  action: CallbackActionEnums;
  data: { productId: string; [other: string]: any };
};

export enum CallbackActionEnums {
  ProductShowAll = 'ProductShowAll',
}

function callBackQueryShowingProduct(limit: 10, offset: 10) {
  return JSON.stringify({
    action: CallbackActionEnums.ProductShowAll,
    data: { limit, offset: offset + 10 },
  });
}
