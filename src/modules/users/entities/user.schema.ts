import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ require: true, unique: true })
  telegramId: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['Seller', 'Customer'] })
  role: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  address: string;

  @Prop({ type: [String] })
  favoriteCategories: Array<number | string>;

  @Prop({ type: Number })
  productLimit: number;

  @Prop({ type: Map, of: String })
  additionalInfo: Map<string, string>;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', function (next) {
  const user = this as UserDocument;
  user.updatedAt = new Date();

  next();
});
