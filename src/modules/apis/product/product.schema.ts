import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Connection, Document, Types } from 'mongoose';
import { Category } from '../categories/category.schema';

import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, strict: 'throw', versionKey: false })
export class Product {
  @Prop({ type: Number, unique: true })
  _id: number;

  @Prop({ required: true, type: String })
  ownerId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, maxlength: 100 })
  description: string; // Maximum of 32 characters

  @Prop({ required: true })
  price: number;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: Category.name,
  })
  categoryId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  attributes: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: false })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
// export type ProductDocument = Document
export type ProductDocument = HydratedDocument<Product>;

export function setupProductSchemaAutoIncrement(connection: Connection) {
  const schema = ProductSchema;
  const AutoIncrement = require('mongoose-sequence')(connection);
  schema.plugin(AutoIncrement, { inc_field: 'id' });

  //@ts-ignore
  schema.plugin(AutoIncrement, {
    inc_field: '_id',
    id: 'product_counter',
  });

  return schema; // Return the modified schema
}
