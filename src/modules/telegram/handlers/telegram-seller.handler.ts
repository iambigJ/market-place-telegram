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
import { FavoriteService } from '../../apis/favorites/favorite.service';
import { CategoryService } from '../../apis/categories/categoy.service';
import { Telegraf } from 'telegraf';
import { Types } from 'mongoose';
import { fmtCaption } from 'telegraf/typings/core/helpers/util';

// Interface for order with product
interface OrderWithProduct {
  _id: string | Types.ObjectId;
  buyerId: string;
  ownerId: string;
  productId: Types.ObjectId;
  quantity: number;
  status: string;
  createdAt: Date;
  product: {
    _id: number;
    name: string;
    price: number;
    description: string;
    images?: string[];
    attributes?: string[];
    stock?: number;
  };
}

// Interface for product in favorite
interface FavoriteWithProduct {
  _id: string | Types.ObjectId;
  userId: string;
  productId: number;
  createdAt: Date;
  product: {
    _id: number;
    name: string;
    price: number;
    description: string;
    images?: string[];
    attributes?: string[];
    stock?: number;
  };
}

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
    private readonly favoriteService: FavoriteService,
    private readonly categoryService: CategoryService,
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
          this.logger.error(
            'error in sendProductMessage',
            e?.stack,
            e?.message,
          );
          continue;
        }
      }

      // Get total product count and calculate total pages
      const totalProducts = await this.productService.countAll();
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      // Send pagination with numbered buttons
      await this.menuService.sendNumberedPaginationButtons(
        currentPage,
        totalPages,
        limit,
        ctx,
      );
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

  private getProductImageUrl(product: ProductDocument): string {
    return product.images?.length
      ? `${this.prefixImagePath}/${product.images[0]}`
      : this.defaultImagePath;
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

  private escapeText(text: string | number): string {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
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

  async handleCancelAddToCart(ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery('سفارش لغو شد');
      await ctx.reply('درخواست شما لغو شد.');
      await this.menuService.sendBuyerMenuKeyboard(ctx);
    } catch (error) {
      this.logger.error('Error in handleCancelAddToCart:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
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

      const orderItem: OrderItemDto = {
        productId,
        buyerId: userId,
        quantity: 1,
      };

      // Create the order
      await this.orderService.create(orderItem);

      this.logger.log(
        `User ${userId} (${userId}) confirmed order for product: ${productId}, Order ID`,
      );

      await ctx.answerCbQuery('سفارش شما با موفقیت ثبت شد');
      await ctx.reply(
        `✅ سفارش شما برای محصول "${product.name}" با موفقیت ثبت شد.\nشماره سفارش:\nهمکاران ما به زودی با شما تماس خواهند گرفت.`,
      );
    } catch (error) {
      this.logger.error('Error in handleAddToCartConfirm:', error);
      await ctx.answerCbQuery('خطا در ثبت سفارش');
      await ctx.reply(
        'متاسفانه خطایی در ثبت سفارش شما رخ داد. لطفا دوباره تلاش کنید.',
      );
    }
  }

  async handleAddToFavorites(ctx: Context, productId: number): Promise<void> {
    try {
      const product = await this.productService.findOne(productId);
      if (!product) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS);
        return;
      }

      // Get user ID from context
      const userId = ctx.from?.id.toString();
      if (!userId) {
        await ctx.answerCbQuery('خطا در شناسایی کاربر');
        return;
      }

      // Add to favorites
      await this.favoriteService.addToFavorites(userId, productId);

      await ctx.answerCbQuery(TelegramMessages.PRODUCT_ADDED_TO_FAVORITES);
    } catch (error) {
      this.logger.error('Error in handleAddToFavorites:', error);
      await ctx.answerCbQuery(TelegramMessages.ERROR_FAVORITE_ACTION);
    }
  }

  private formatFavoriteMessage(favorite: FavoriteWithProduct): string {
    const product = favorite.product;
    const escapedProductId = this.escapeText(product._id.toString());
    const escapedProductName = this.escapeText(product.name);
    const escapedPrice = this.escapeText(product.price);

    // Format the date in Persian format
    const favoriteDate = new Date(favorite.createdAt);
    const formattedDate = favoriteDate.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const escapedDate = this.escapeText(formattedDate);

    return `
🆔 *شناسه محصول:* ${escapedProductId}

📦 *نام محصول:* ${escapedProductName}

💰 *قیمت:* ${escapedPrice} تومان

🕒 *تاریخ افزودن به علاقه‌مندی‌ها:* ${escapedDate}
  `;
  }

  async handleRemoveFromFavorites(
    ctx: Context,
    productId: number,
  ): Promise<void> {
    try {
      // Get user ID from context
      const userId = ctx.from?.id.toString();
      if (!userId) {
        await ctx.answerCbQuery('خطا در شناسایی کاربر');
        return;
      }

      // Remove from favorites
      await this.favoriteService.removeFromFavorites(userId, productId);

      await ctx.answerCbQuery(TelegramMessages.PRODUCT_REMOVED_FROM_FAVORITES);
    } catch (error) {
      this.logger.error('Error in handleRemoveFromFavorites:', error);
      await ctx.answerCbQuery(TelegramMessages.ERROR_FAVORITE_ACTION);
    }
  }

  async handleShowUserFavorites(ctx: Context): Promise<void> {
    try {
      console.log('handleShowUserFavorites');
      // Get user ID from context
      const userId = ctx.from?.id.toString();
      if (!userId) {
        await ctx.reply('خطا در شناسایی کاربر');
        return;
      }

      // Get user favorites with product details
      const favorites =
        (await this.favoriteService.getUserFavoritesWithProducts(
          userId,
        )) as unknown as FavoriteWithProduct[];

      if (!favorites || favorites.length === 0) {
        await ctx.reply(TelegramMessages.NO_FAVORITES);
        return;
      }

      // Send a header message
      await ctx.reply('❤️ *علاقه‌مندی‌های شما*', { parse_mode: 'MarkdownV2' });

      // Display each favorite with product details and image
      for (const favorite of favorites) {
        try {
          // Get the product image URL
          const imageUrl = this.getOrderProductImageUrl(favorite.product);
          console.log('fucking favoitesssssssss issssssssss', favorite);
          // Send the photo with caption and remove button
          await ctx.replyWithPhoto(
            { url: imageUrl },
            {
              caption: this.formatFavoriteMessage(favorite),
              parse_mode: 'MarkdownV2',
              ...this.menuService.FavoriteRemoveInline(favorite.product._id),
            },
          );
        } catch (error) {
          this.logger.error(
            `Error sending favorite with product image: ${error}`,
          );
          // Fallback to text message if image fails
          await ctx.reply(this.formatFavoriteMessage(favorite), {
            parse_mode: 'MarkdownV2',
            ...this.menuService.FavoriteRemoveInline(favorite.productId),
          });
        }
      }
    } catch (error) {
      this.logger.error('Error in handleShowUserFavorites:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async handleCancelOrder(ctx: Context, orderId: string): Promise<void> {
    try {
      this.logger.log(`Attempting to cancel order ${orderId}`);

      // Find the order
      const order = await this.orderService.findOne(orderId);
      if (!order) {
        await ctx.reply('سفارش مورد نظر یافت نشد.');
        return;
      }

      // Check if user owns this order
      const userId = ctx.from?.id.toString();
      if (order.buyerId !== userId) {
        await ctx.reply('شما مجاز به لغو این سفارش نیستید.');
        return;
      }

      // Check if the order is already cancelled or completed
      if (order.status !== 'pending') {
        await ctx.reply(
          'این سفارش قابل لغو نیست زیرا در وضعیت در انتظار بررسی نمی‌باشد.',
        );
        return;
      }

      // Cancel the order
      await this.orderService.update(orderId, { status: 'cancelled' });
      this.logger.log(
        `Order ${orderId} successfully cancelled by user ${userId}`,
      );

      await ctx.answerCbQuery(TelegramMessages.ORDER_CANCELLED);
      await ctx.reply('✅ سفارش شما با موفقیت لغو شد.');
    } catch (error) {
      this.logger.error('Error in handleCancelOrder:', error);
      await ctx.answerCbQuery(TelegramMessages.ERROR_ORDER_CANCEL);
      await ctx.reply('خطا در لغو سفارش. لطفا دوباره تلاش کنید.');
    }
  }

  // Update formatOrderMessage to use the interface
  private formatOrderMessage(order: OrderWithProduct): string {
    const product = order.product;
    const escapedOrderId = this.escapeText(order._id.toString());
    const escapedProductName = this.escapeText(product.name);
    const escapedPrice = this.escapeText(product.price);
    const escapedQuantity = this.escapeText(order.quantity);
    const status = this.getStatusTranslation(order.status);
    const escapedStatus = this.escapeText(status);

    // Format the date in Persian format
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const escapedDate = this.escapeText(formattedDate);

    return `
      🆔 *شماره سفارش:*  ${escapedOrderId}

      📦 *نام محصول:* ${escapedProductName}

      💰 *قیمت:* ${escapedPrice} تومان

      🔢 *تعداد:* ${escapedQuantity}

      📊 *وضعیت:* ${escapedStatus}

      🕒 *تاریخ ثبت سفارش:* ${escapedDate}
          `;
  }

  // Update handleShowUserOrders to use the interface
  async handleShowUserOrders(ctx: Context): Promise<void> {
    try {
      console.log('handleShowUserOrders');
      // Get user ID from context
      const userId: string = ctx.from?.id.toString();
      const orders = (await this.orderService.findWithProduct(
        userId,
      )) as OrderWithProduct[];

      if (!orders || orders?.length === 0) {
        await ctx.reply(TelegramMessages.NO_ORDERS);
        return;
      }

      // Send a header message
      await ctx.reply('📋 *سفارشات شما*', { parse_mode: 'MarkdownV2' });

      // Display each order with product details and image
      for (const order of orders) {
        try {
          // Get the product image URL
          const imageUrl = this.getOrderProductImageUrl(order.product);

          // Send the photo with caption and cancel button if order is pending
          await ctx.replyWithPhoto(
            { url: imageUrl },
            {
              caption: this.formatOrderMessage(order),
              parse_mode: 'MarkdownV2',
              ...(order.status === 'pending'
                ? this.menuService.OrderCancelInline(order._id.toString())
                : {}),
            },
          );
        } catch (error) {
          this.logger.error(`Error sending order with product image: ${error}`);
          await ctx.reply(this.formatOrderMessage(order), {
            parse_mode: 'MarkdownV2',
            ...(order.status === 'pending'
              ? this.menuService.OrderCancelInline(order._id.toString())
              : {}),
          });
        }
      }
    } catch (error) {
      this.logger.error('Error in handleShowUserOrders:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  // Helper method to get image URL for product in order
  private getOrderProductImageUrl(
    product: OrderWithProduct['product'],
  ): string {
    return product.images?.length
      ? `${this.prefixImagePath}/${product.images[0]}`
      : this.defaultImagePath;
  }

  /**
   * Translate order status to Persian
   */
  private getStatusTranslation(status: string): string {
    switch (status) {
      case 'pending':
        return 'در انتظار بررسی';
      case 'completed':
        return 'تکمیل شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  }

  async handleShowCategories(ctx: Context): Promise<void> {
    try {
      console.log('handleShowCategories');
      // Get all categories
      const categories = await this.categoryService.findAll();

      if (!categories || categories.length === 0) {
        await ctx.reply(TelegramMessages.NO_CATEGORIES);
        return;
      }

      // Send a header message with HTML formatting
      await ctx.reply('<b>🗂️ دسته‌بندی‌های محصولات</b>', {
        parse_mode: 'HTML',
      });

      // Display each category with its details
      for (const category of categories) {
        try {
          // Format category message with HTML
          const message = `
                <b> عنوان دسته‌بندی: \n ${category.name}</b>

                <i>توضیحات دسته‌بندی: \n ${category.description}</i>
                `;
          // Send the message with view products button
          await ctx.reply(message, {
            parse_mode: 'HTML',
            ...this.menuService.CategoryShowProductsInline(
              category._id.toString(),
            ),
          });
        } catch (error) {
          this.logger.error(`Error sending category: ${error}`);
        }
      }
    } catch (error) {
      this.logger.error('Error in handleShowCategories:', error);
      await ctx.reply(TelegramMessages.ERROR_CATEGORY_SHOW);
    }
  }

  async handleShowProductsByCategory(
    ctx: Context,
    categoryId: string,
  ): Promise<void> {
    try {
      const limit = 10;
      const offset = 0;
      const products = await this.productService.findByCategory(
        categoryId,
        limit,
        offset,
      );

      // Get the category name
      const category = await this.categoryService.findOne(categoryId);

      if (!products || products.length === 0) {
        await ctx.reply(TelegramMessages.NO_PRODUCTS_IN_CATEGORY);
        return;
      }

      // Send a header message with HTML formatting
      await ctx.reply(`<b>محصولات در دسته‌بندی: ${category.name}</b>`, {
        parse_mode: 'HTML',
      });

      // Display each product
      for (const product of products) {
        try {
          await this.sendProductMessage(ctx, product);
        } catch (e) {
          this.logger.error(e);
          continue;
        }
      }

      // Get total product count and calculate total pages
      const totalProducts =
        await this.productService.countByCategory(categoryId);
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = 1; // First page

      // Send pagination with numbered buttons
      await this.menuService.sendNumberedPaginationButtons(
        currentPage,
        totalPages,
        limit,
        ctx,
      );
    } catch (error) {
      this.logger.error('Error in handleShowProductsByCategory:', error);
      await ctx.reply(TelegramMessages.ERROR_PRODUCT_SHOW);
    }
  }
}
