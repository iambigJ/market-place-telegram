import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './entities/favorite.schema';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoriteRepository {
  private readonly logger = new Logger(FavoriteRepository.name);

  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
  ) {}

  async addFavorite(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    try {
      return await this.favoriteModel.create(createFavoriteDto);
    } catch (error) {
      // Handle duplicate key error (if user already favorited this product)
      if (error.code === 11000) {
        // Return the existing document instead of throwing an error
        return this.favoriteModel.findOne({
          userId: createFavoriteDto.userId,
          productId: createFavoriteDto.productId,
        });
      }
      throw error;
    }
  }

  async removeFavorite(userId: string, productId: number): Promise<boolean> {
    const result = await this.favoriteModel.deleteOne({ userId, productId });
    return result.deletedCount > 0;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteModel.find({ userId }).exec();
  }

  async isFavorite(userId: string, productId: number): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({ userId, productId });
    return !!favorite;
  }
} 