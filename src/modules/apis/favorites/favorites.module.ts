import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './entities/favorite.schema';
import { FavoriteRepository } from './favorite.repository';
import { FavoriteService } from './favorite.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    ProductModule,
  ],
  providers: [FavoriteService, FavoriteRepository],
  exports: [FavoriteService],
})
export class FavoritesModule {}
