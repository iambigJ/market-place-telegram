import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, strict: 'throw', versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  telegramId: string;

  @Prop({
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // Email validation using regex
  })
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ enum: ['Seller', 'Customer'] })
  role: string;

  @Prop()
  deletedAt: Date;

  @Prop({ default: false })
  active: boolean;

  @Prop()
  address: string;

  @Prop({ type: [String] })
  favoriteCategories: Array<number | string>;

  @Prop({ type: [Number], default: [] })
  favoriteProducts: number[];

  @Prop({ type: Number })
  productLimit: number;

  @Prop({ type: Number })
  categoryLimit: number;

  @Prop({ type: Object })
  additionalInfo: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  const user = this as UserDocument;
  user.active = false;
  user.role = 'Customer';
  user.productLimit = 5;
  user.categoryLimit = 2;
  next();
});
