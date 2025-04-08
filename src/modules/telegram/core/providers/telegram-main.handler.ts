import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { ITelegramProductService } from '../../interfaces/telegram.interface';
import { ProductService } from '../../../apis/product/product.service';
import { ConfigService } from '@nestjs/config';
import { ProductDocument } from '../../../apis/product/product.schema';
import { TelegramMessages } from '../../helper/telegram.constants';
import { TelegramMenuService } from './telegram-menu.handler';

@Injectable()
export class TelegramProductHandler implements ITelegramProductService {
  private prefixImagePath: string;
  private defaultImagePath: string;
  private readonly logger = new Logger(TelegramProductHandler.name);

  constructor(
    private readonly menuService: TelegramMenuService,
    private readonly productService: ProductService,
    private readonly config: ConfigService,
  ) {
    const ip = this.config.get<string>('host_ip');
    const port = this.config.get<string>('port');
    this.prefixImagePath = `http://${ip}:${port}/storage`;
    this.defaultImagePath = `${this.prefixImagePath}/${this.config.get('host_defaultImage')}`;
  }

  async handleShowAllProducts(ctx: Context): Promise<void> {
    await this.handleShowProducts(ctx, 10, 0);
  }

  async handleShowProducts(
    ctx: Context,
    limit: number = 10,
    offset: number = 0,
  ): Promise<void> {
    try {
      const products = await this.productService.findAll(limit, offset);
      if (!products?.length) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }
      for (const product of products) {
        try {
          await this.sendProductMessage(ctx, product);
        } catch (e) {
          this.logger.error(e);
          continue;
        }
      }

      await this.menuService.sendProductPaginationButtoms(offset, limit, ctx);
    } catch (error) {
      this.logger.error('Error in handleShowProducts:', error);
      await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    }
  }

  async handleShowFullProduct(ctx: Context, productId: string): Promise<void> {
    try {
      const product = await this.productService.findOne(productId);
      if (!product) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }

      await this.sendProductMessage(ctx, product, true);
    } catch (error) {
      this.logger.error('Error in handleShowFullProduct:', error);
      await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    }
  }

  private async sendProductMessage(
    ctx: Context,
    product: ProductDocument,
    isFullView: boolean = false,
  ): Promise<void> {
    await this.sendProductMessageHanlder(
      ctx,
      product._id.toString(),
      this.getProductImageUrl(product),
      isFullView
        ? this.formatFullProductCaption(product)
        : this.formatProductCaption(product),
      product,
    );
  }

  async sendProductMessageHanlder(
    ctx: Context,
    productId: string,
    imageUrl: string,
    caption: string,
    product: ProductDocument,
  ): Promise<void> {
    try {
      // Send all photos except the last one
      if (product.images?.length > 1) {
        for (let i = 0; i < product.images.length - 1; i++) {
          await ctx.replyWithPhoto({
            url: `${this.prefixImagePath}/${product.images[i]}`,
          });
        }
      }

      // Send the last photo with caption and inline keyboard
      await ctx.replyWithPhoto(
        { url: imageUrl },
        {
          caption,
          ...this.menuService.ProductShowInline(productId),
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (error) {
      this.logger.error('Error sending product message:', error);
      await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    }
  }

  async handleAddToCart(ctx: Context, productId: string): Promise<void> {
    try {
      const product = await this.productService.findOne(productId);
      if (!product) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }

      await ctx.answerCbQuery('محصول به سبد خرید اضافه شد');
    } catch (error) {
      this.logger.error('Error in handleAddToCart:', error);
      await ctx.answerCbQuery('خطا در اضافه کردن به سبد خرید');
    }
  }

  async handleAddToFavorites(ctx: Context, productId: string): Promise<void> {
    try {
      const product = await this.productService.findOne(productId);
      if (!product) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }

      // TODO: Implement favorites logic
      await ctx.answerCbQuery('محصول به علاقه‌مندی‌ها اضافه شد');
    } catch (error) {
      this.logger.error('Error in handleAddToFavorites:', error);
      await ctx.answerCbQuery('خطا در اضافه کردن به علاقه‌مندی‌ها');
    }
  }

  private formatProductCaption(product: ProductDocument): string {
    const escapedName = this.escapeText(product.name);
    const escapedPrice = this.escapeText(product.price as any);
    const escapedDescription = this.escapeText(product.description);

    return `
📦 *${escapedName}*
💰 قیمت: ${escapedPrice} تومان
📝 توضیحات: ${escapedDescription}
    `;
  }

  private formatFullProductCaption(product: ProductDocument): string {
    const escapedName = this.escapeText(product.name);
    const escapedPrice = this.escapeText(product.price as any);
    const escapedDescription = this.escapeText(product.description);
    const escapedId = this.escapeText(product._id.toString());
    const escapedAttributes = product.attributes
      .map((attr) => this.escapeText(attr))
      .join(', ');
    const escapedStock = product.stock
      ? this.escapeText(product.stock)
      : 'نامشخص';

    return `
🆔 *شناسه محصول:* \u200F${escapedId}

📦 *نام محصول:* ${escapedName}

💰 *قیمت:* ${escapedPrice} تومان

📝 *توضیحات:*
${escapedDescription}

🏷️ *مشخصات:*
${escapedAttributes || 'ندارد'}

📊 *موجودی:* ${escapedStock}
    `;
  }

  private getProductImageUrl(product: ProductDocument): string {
    return product.images?.length
      ? `${this.prefixImagePath}/${product.images[0]}`
      : this.defaultImagePath;
  }

  private escapeText(text: string | number): string {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }
}
