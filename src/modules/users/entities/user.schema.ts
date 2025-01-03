import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {Document, Schema} from 'mongoose';
import ObjectId = module

export type UserDocument = User & Document;

@Schema({ timestamps: true, strict: 'throw' })
export class User {
  @Prop({ require: true, unique: true })
  telegramId: string;

  @Prop({
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // Email validation using regex
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['Seller', 'Customer'] })
  role: string;

  @Prop()
  deletedAt: Date;

  @Prop({ default: false })
  active: boolean;

  @Prop()
  address: string;

  @Prop({ type: String })
  fullAccessUser: string;

  @Prop({ type: [String] })
  favoriteCategories: Array<number | string>;

  @Prop({ type: Number })
  productLimit: number;

  @Prop({ type: Number })
  attributeLimite: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', function (next) {
  const user = this as UserDocument;
  user.active = false;
  next();
});