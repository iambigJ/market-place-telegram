import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { ITelegramProductService } from '../interfaces/telegram.interface';
import { ProductService } from '../../apis/product/product.service';
import { ConfigService } from '@nestjs/config';
import { ProductDocument } from '../../apis/product/product.schema';
import { TelegramMessages } from '../helper/telegram.constants';
import { TelegramMenuService } from './telegram-menu.handler';
import { OrderService } from 'src/modules/apis/order/order.service';
import { OrderItemDto } from 'src/modules/apis/order/dto/create-order.dto';
import { UsersService } from '../../apis/users/users.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramProductHandler implements ITelegramProductService {
  private prefixImagePath: string;
  private defaultImagePath: string;
  private readonly logger = new Logger(TelegramProductHandler.name);
  private bot: Telegraf;

  constructor(
    private readonly menuService: TelegramMenuService,
    private readonly productService: ProductService,
    private readonly config: ConfigService,
    private readonly orderService: OrderService,
    private readonly usersService: UsersService,
  ) {
    const ip = this.config.get<string>('host_ip');
    const port = this.config.get<string>('port');
    this.prefixImagePath = `http://${ip}:${port}/storage`;
    this.defaultImagePath = `${this.prefixImagePath}/${this.config.get('host_defaultImage')}`;
    const token = this.config.get<string>('Telegram_Token');
    if (token) {
      this.bot = new Telegraf(token);
    }
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

  async handleShowFullProduct(ctx: Context, productId: number): Promise<void> {
    try {
      ctx.answerCbQuery();
      const product = await this.productService.findOne(productId);
      if (!product) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }

      await this.sendFullProductMessage(ctx, product);
    } catch (error) {
      this.logger.error('Error in handleShowFullProduct:', error);
      await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    }
  }

  private async sendFullProductMessage(
    ctx: Context,
    product: ProductDocument,
  ): Promise<void> {
    await this.sendProductMessageHandler(
      ctx,
      product._id as unknown as number,
      this.getProductImageUrl(product),
      this.formatFullProductCaption(product),
      product,
      true, // isFullDetails
    );
  }

  private async sendProductMessage(
    ctx: Context,
    product: ProductDocument,
  ): Promise<void> {
    await this.sendProductMessageHandler(
      ctx,
      product._id as unknown as number,
      this.getProductImageUrl(product),
      this.formatProductCaption(product),
      product,
      false, // isFullDetails
    );
  }

  /**
   * Sends a product message with multiple images and appropriate caption
   * @param ctx Telegram context
   * @param productId Product ID string
   * @param imageUrl Main image URL
   * @param caption Formatted caption text
   * @param product Product document
   * @param isFullDetails Whether to show full product details
   */
  private async sendProductMessageHandler(
    ctx: Context,
    productId: number,
    imageUrl: string,
    caption: string,
    product: ProductDocument,
    isFullDetails: boolean,
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
          ...(isFullDetails
            ? this.menuService.ProductFullShowInline(productId)
            : this.menuService.ProductShowInline(productId)),
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (error) {
      this.logger.error('Error sending product message:', error);
      await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    }
  }

  async handleAddToCart(ctx: Context, productId: number): Promise<void> {
    try {
      const product = await this.productService.findOne(productId);
      if (!product) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }

      await ctx.reply(
        'این محصول روش پرداخت انلاین ندارد و اطلاعات شما مستقیم در اختیار فروشنده قرار میگیرد ایا ایا درخواست خود مطمئن هستید؟',
        {
          ...this.menuService.ProductAddToCartInline(productId),
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (error) {
      this.logger.error('Error in handleAddToCart:', error);
      await ctx.answerCbQuery('خطا در اضافه کردن به سبد خرید');
    }
  }

  async handleAddToFavorites(ctx: Context, productId: number): Promise<void> {
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

  async handleAddToCartConfirm(ctx: Context, productId: number): Promise<void> {
    try {
      const product = await this.productService.findOne(productId);
      if (!product) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }
      
      const userId = ctx.from?.id.toString();
      const username = ctx.from?.username || 'کاربر ناشناس';

      // Create order item
      const orderItem: OrderItemDto = {
        productId,
        buyerId: userId,
        quantity: 1,
      };
      
      // Create the order
      const createdOrder = await this.orderService.create(orderItem);
      let orderId = 'N/A';
      
      if (createdOrder && typeof createdOrder === 'object') {
        // Safely access _id using bracket notation
        orderId = createdOrder['_id'] ? String(createdOrder['_id']) : 'N/A';
      }
      
      this.logger.log(
        `User ${username} (${userId}) confirmed order for product: ${productId}, Order ID: ${orderId}`,
      );

      // Inform the customer about the successful order
      await ctx.answerCbQuery('سفارش شما با موفقیت ثبت شد');
      await ctx.reply(
        `✅ سفارش شما برای محصول "${product.name}" با موفقیت ثبت شد.\nشماره سفارش: ${orderId}\nهمکاران ما به زودی با شما تماس خواهند گرفت.`,
      );
    } catch (error) {
      this.logger.error('Error in handleAddToCartConfirm:', error);
      await ctx.answerCbQuery('خطا در ثبت سفارش');
      await ctx.reply(
        'متاسفانه خطایی در ثبت سفارش شما رخ داد. لطفا دوباره تلاش کنید.',
      );
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
