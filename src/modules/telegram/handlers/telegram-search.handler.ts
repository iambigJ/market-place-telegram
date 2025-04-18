import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { ProductService } from '../../apis/product/product.service';
import {
  ConversationState,
  StateMessages,
  UserStateData,
} from '../helper/telegram-state.constants';
import { TelegramStateMiddleware } from './telegram-state.middleware';
import { TelegramMenuService } from './telegram-menu.handler';
import { CategoryService } from '../../apis/categories/categoy.service';

@Injectable()
export class TelegramSearchHandler {
  private readonly logger = new Logger(TelegramSearchHandler.name);

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly menuService: TelegramMenuService,
  ) {}

  /**
   * Handle simple search requests
   * @param ctx Telegram context
   */
  async handleSimpleSearch(ctx: Context): Promise<void> {
    try {
      if (
        !ctx.state.userState ||
        ctx.state.userState.state !== ConversationState.SEARCH_RESULTS
      ) {
        return;
      }

      const stateManager: TelegramStateMiddleware = ctx.state.stateManager;
      const userState: UserStateData = ctx.state.userState;
      const query = userState.data.searchQuery;

      if (!query) {
        await ctx.reply(StateMessages.NO_RESULTS);
        await stateManager.clearUserState(ctx.from.id.toString());
        return;
      }

      // Perform the search - this will depend on your ProductService implementation
      // For this example, we'll use a simple name search
      const products = await this.productService.searchByName(query);

      if (!products || products.length === 0) {
        await ctx.reply(StateMessages.NO_RESULTS);
        await stateManager.clearUserState(ctx.from.id.toString());
        return;
      }

      // Display search results header
      await ctx.reply(`${StateMessages.SEARCH_RESULTS} ${query}`);

      // Display each product
      for (const product of products) {
        try {
          await this.sendProductMessage(ctx, product);
        } catch (error) {
          this.logger.error(
            `Error sending product: ${error.message}`,
            error.stack,
          );
        }
      }

      // Clear state after search is complete
      await stateManager.clearUserState(ctx.from.id.toString());
    } catch (error) {
      this.logger.error(
        `Error in handleSimpleSearch: ${error.message}`,
        error.stack,
      );
      await ctx.reply(StateMessages.NO_RESULTS);
      if (ctx.state.stateManager) {
        await ctx.state.stateManager.clearUserState(ctx.from.id.toString());
      }
    }
  }

  /**
   * Handle advanced search requests
   * @param ctx Telegram context
   */
  async handleAdvancedSearch(ctx: Context): Promise<void> {
    try {
      if (
        !ctx.state.userState ||
        ctx.state.userState.state !== ConversationState.ADVANCED_SEARCH_RESULTS
      ) {
        return;
      }

      const stateManager: TelegramStateMiddleware = ctx.state.stateManager;
      const userState: UserStateData = ctx.state.userState;
      const searchParams = userState.data.advancedSearch;

      if (!searchParams) {
        await ctx.reply(StateMessages.NO_RESULTS);
        await stateManager.clearUserState(ctx.from.id.toString());
        return;
      }

      // Perform the advanced search
      const products = await this.productService.advancedSearch(
        searchParams.name,
        searchParams.category,
        searchParams.priceMin,
        searchParams.priceMax,
      );

      if (!products || products.length === 0) {
        await ctx.reply(StateMessages.NO_RESULTS);
        await stateManager.clearUserState(ctx.from.id.toString());
        return;
      }

      // Build search description
      const searchDescription = this.buildSearchDescription(searchParams);

      // Display search results header
      await ctx.reply(`${StateMessages.SEARCH_RESULTS} ${searchDescription}`);

      // Display each product
      for (const product of products) {
        try {
          await this.sendProductMessage(ctx, product);
        } catch (error) {
          this.logger.error(
            `Error sending product: ${error.message}`,
            error.stack,
          );
        }
      }

      // Clear state after search is complete
      await stateManager.clearUserState(ctx.from.id.toString());
    } catch (error) {
      this.logger.error(
        `Error in handleAdvancedSearch: ${error.message}`,
        error.stack,
      );
      await ctx.reply(StateMessages.NO_RESULTS);
      if (ctx.state.stateManager) {
        await ctx.state.stateManager.clearUserState(ctx.from.id.toString());
      }
    }
  }

  /**
   * Build a description of the search parameters
   * @param searchParams Search parameters
   * @returns Description string
   */
  private buildSearchDescription(searchParams: any): string {
    const parts = [];

    if (searchParams.name) {
      parts.push(`نام: ${searchParams.name}`);
    }

    if (searchParams.category) {
      parts.push(`دسته: ${searchParams.category}`);
    }

    if (searchParams.priceMin !== undefined) {
      parts.push(`قیمت از: ${searchParams.priceMin} تومان`);
    }

    if (searchParams.priceMax !== undefined) {
      parts.push(`قیمت تا: ${searchParams.priceMax} تومان`);
    }

    return parts.join(', ');
  }

  /**
   * Send a product message with image and formatted text
   * Private method copied from product handler to maintain consistent display
   * @param ctx Telegram context
   * @param product Product to display
   */
  private async sendProductMessage(ctx: Context, product: any): Promise<void> {
    try {
      // Use the menu service to get the inline keyboard for the product
      const inlineKeyboard = this.menuService.ProductShowInline(product._id);

      // Format product caption
      const caption = this.formatProductCaption(product);

      // Get product image URL - adjust this based on your image storage implementation
      const imageUrl = product.images?.length
        ? `http://your-server-url/storage/${product.images[0]}`
        : 'http://your-server-url/storage/default.jpg';

      // Send product with photo
      await ctx.replyWithPhoto(
        { url: imageUrl },
        {
          caption,
          ...inlineKeyboard,
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (error) {
      this.logger.error(
        `Error sending product message: ${error.message}`,
        error.stack,
      );
      // Fall back to text-only if image fails
      await ctx.reply(this.formatProductCaption(product), {
        parse_mode: 'MarkdownV2',
      });
    }
  }

  /**
   * Format product details as a caption
   * @param product Product to format
   * @returns Formatted string safe for MarkdownV2
   */
  private formatProductCaption(product: any): string {
    // Escape markdown characters
    const escapedName = this.escapeMarkdown(product.name);
    const escapedPrice = this.escapeMarkdown(product.price.toString());
    const escapedDescription = this.escapeMarkdown(product.description);

    return `
📦 *${escapedName}*
💰 قیمت: ${escapedPrice} تومان
📝 توضیحات: ${escapedDescription}
    `;
  }

  /**
   * Escape special characters for Telegram MarkdownV2
   * @param text Text to escape
   * @returns Escaped text
   */
  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }
}
