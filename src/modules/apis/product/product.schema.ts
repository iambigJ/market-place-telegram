import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/entities/user.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, strict: 'throw' })
export class Product {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, maxlength: 32 })
  description: string; // Maximum of 32 characters

  @Prop({ required: true })
  price: number;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: User.name,
  })
  categoryId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  attributes: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
