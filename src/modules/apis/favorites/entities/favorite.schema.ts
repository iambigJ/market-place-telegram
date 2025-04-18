import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../product/product.schema';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true, strict: 'throw', versionKey: false })
export class Favorite {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, type: Number, ref: Product.name })
  productId: number;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Create a compound index for userId + productId to ensure uniqueness
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true }); 