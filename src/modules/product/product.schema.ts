import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema'; // Adjust the path as needed

export type ProductDocument = Product & Document;
export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, strict: 'throw' })
export class Product {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, maxlength: 32 })
  description: string; // Maximum of 32 characters

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  categoryId: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  attributes: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

@Schema({ timestamps: true, strict: 'throw' })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ required: true })
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
