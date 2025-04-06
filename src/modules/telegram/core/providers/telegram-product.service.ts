import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { ProductService } from '../../../apis/product/product.service';
import { ConfigService } from '@nestjs/config';
import {
  Product,
  ProductDocument,
} from 'src/modules/apis/product/product.schema';
import { TelegramMessages } from '../../helper/telegram.constants';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { TelegramMenuService } from './telegram-menu.service';

@Injectable()
export class TelegramProductService {
  private prefixImagePath: string;
  private defaultImagePath: string;
  private readonly logger = new Logger(TelegramProductService.name);

  constructor(
    private menuService: TelegramMenuService,
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

  private formatFullProductCaption(product: Product): string {
    const escapedName = this.escapeText(product.name);
    const escapedPrice = this.escapeText(product.price as any);
    const escapedDescription = this.escapeText(product.description);
    const escapedAttributes = product.attributes
      .map((attr) => this.escapeText(attr))
      .join(', ');
    const escapedStock = product.stock
      ? this.escapeText(product.stock)
      : 'نامشخص';

    return `
📦 *${escapedName}*
💰 قیمت: ${escapedPrice} تومان
📝 توضیحات: ${escapedDescription}
🏷️ مشخصات: ${escapedAttributes || 'ندارد'}
📊 موجودی: ${escapedStock}
    `;
  }

  private escapeText(text: string | number): string {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  async handleShowAllProducts(
    ctx: Context,
    limit: number = 10,
    offset: number = 10,
  ): Promise<any> {
    try {
      const products = await this.fetchProducts(limit, offset);
      if (!products?.length) {
        return await ctx.reply(TelegramMessages.NO_PRODUCTS);
      }

      await this.sendProductsToChat(products, ctx);
      await this.menuService.sendProductPaginationButtoms(offset, limit, ctx);
    } catch (error: any) {
      this.logger.error('Error in handleShowProducts:', error);
      await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    }
  }


  async handleShowFullProducts(
    ctx: Context,
    limit: number = 10,
    offset: number = 10,
  ): Promise<any> {
    // try {
    //   const products = await this.fetchProducts(limit, offset);
    //   if (!products?.length) {
    //     return await ctx.reply(TelegramMessages.NO_PRODUCTS);
    //   }

    //   await this.sendProductsToChat(products, ctx);
    //   await this.menuService.sendProductPaginationButtoms(offset, limit, ctx);
    // } catch (error: any) {
    //   this.logger.error('Error in handleShowProducts:', error);
    //   await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    // }
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
            ...this.menuService.ProductShowInline(product._id.toString()),
            parse_mode: 'MarkdownV2',
          },
        );
      } catch (error) {
        this.logger.error(
          `Error sending product ${product._id.toString()}:`,
          error,
        );
      }
    }
  }

  private getProductImageUrl(product: ProductDocument): string {
    return product.images?.length
      ? `${this.prefixImagePath}/${product.images[0]}`
      : this.defaultImagePath;
  }
}
