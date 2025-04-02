import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { ProductService } from '../../../apis/product/product.service';
import { ConfigService } from '@nestjs/config';
import {
  Product,
  ProductDocument,
} from 'src/modules/apis/product/product.schema';
import { TelegramMessages } from '../../helper/telegram.constants';
import { TelegramActionsMenu } from './telegram-menu.service';

@Injectable()
export class TelegramProductService {
  private prefixImagePath: string;
  private defaultImagePath: string;
  private readonly logger = new Logger(TelegramProductService.name);

  constructor(
    private productService: ProductService,
    private config: ConfigService,
  ) {
    const ip = this.config.get<string>('host_ip');
    this.prefixImagePath = `http://${ip}/storage`;
    this.defaultImagePath = `${this.prefixImagePath}/${this.config.get('host_defaultImage')}`;
  }

  private formatProductCaption(product: Product): string {
    const escapedName = this.escapeText(product.name);
    const escapedPrice = this.escapeText(product.price as any);
    const escapedDescription = this.escapeText(product.description);

    return `
📦 *${escapedName}*
💰 قیمت: ${escapedPrice} تومان
📝 توضیحات: ${escapedDescription}
    `;
  }

  private escapeText(text: string | number): string {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  async handleShowProducts(
    limit: number,
    offset: number,
    ctx: Context,
  ): Promise<void> {
    try {
      const products = await this.fetchProducts(limit, offset);
      if (!products?.length) {
        return await ctx.reply(TelegramMessages.NoProducts);
      }

      await this.sendProductsToChat(products, ctx);
      await this.sendPaginationBuxttons(ctx, offset, limit);
    } catch (error) {
      this.logger.error('Error in handleShowProducts:', error);
      await ctx.reply(TelegramMessages.ErrorProductShow);
    }
  }

  private async fetchProducts(
    limit: number,
    offset: number,
  ): Promise<ProductDocument[]> {
    return this.productService.findAll(limit, offset);
  }

  private async sendProductsToChat(
    products: ProductDocument[],
    ctx: Context,
  ): Promise<void> {
    for (const product of products) {
      try {
        const url = this.getProductImageUrl(product);
        await ctx.replyWithPhoto(
          { url },
          {
            caption: this.formatProductCaption(product),
            parse_mode: 'MarkdownV2',
            ...TelegramActionsMenu.createProductShowKeyboard(
              product._id.toString(),
            ),
          },
        );
      } catch (error) {
        this.logger.error(`Error sending product ${product._id}:`, error);
      }
    }
  }

  private getProductImageUrl(product: ProductDocument): string {
    return product.images?.length
      ? `${this.prefixImagePath}/${product.images[0]}`
      : this.defaultImagePath;
  }
}
