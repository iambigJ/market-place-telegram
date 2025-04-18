import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FavoriteRepository } from './favorite.repository';
import { ProductService } from '../product/product.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Favorite } from './entities/favorite.schema';
import { ProductDocument } from '../product/product.schema';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly productService: ProductService,
  ) {}

  async addToFavorites(userId: string, productId: number): Promise<Favorite> {
    try {
      // Check if product exists
      await this.productService.findOne(productId);

      const favoriteDto: CreateFavoriteDto = {
        userId,
        productId,
      };

      return await this.favoriteRepository.addFavorite(favoriteDto);
    } catch (error) {
      this.logger.error(
        `Error adding product ${productId} to favorites:`,
        error,
      );
      throw new BadRequestException('Could not add product to favorites');
    }
  }

  async removeFromFavorites(
    userId: string,
    productId: number,
  ): Promise<boolean> {
    try {
      const result = await this.favoriteRepository.removeFavorite(
        userId,
        productId,
      );
      if (!result) {
        throw new NotFoundException(`Product ${productId} is not in favorites`);
      }
      return true;
    } catch (error) {
      this.logger.error(
        `Error removing product ${productId} from favorites:`,
        error,
      );
      throw new BadRequestException('Could not remove product from favorites');
    }
  }

  async getUserFavoritesWithProducts(
    userId: string,
  ): Promise<Array<Favorite & { product: ProductDocument }>> {
    try {
      console.log('getUserFavoritesWithProducts', userId);
      const favorites = await this.favoriteRepository.getUserFavorites(userId);

      // No favorites found
      if (!favorites || favorites.length === 0) {
        return [];
      }

      // Get product details for each favorite
      const favoritesWithProducts = await Promise.all(
        favorites.map(async (favorite) => {
          const product = await this.productService.findOne(favorite.productId);
          return {
            ...favorite,
            product,
          };
        }),
      );

      return favoritesWithProducts;
    } catch (error) {
      this.logger.error(`Error fetching favorites for user ${userId}:`, error);
      throw new BadRequestException('Could not fetch favorites');
    }
  }

  async isFavorite(userId: string, productId: number): Promise<boolean> {
    return this.favoriteRepository.isFavorite(userId, productId);
  }
}
