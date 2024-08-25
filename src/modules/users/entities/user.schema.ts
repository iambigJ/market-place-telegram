import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ require: true })
  telegramId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
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

  @Prop({ type: [{ type: String }] })
  favoriteCategories: string[];

  @Prop({ type: Map, of: String })
  additionalInfo: Map<string, string>; // Any additional key-value info about the user
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', function (next) {
  const user = this as UserDocument;

  // Update the updatedAt field before saving
  user.updatedAt = new Date();

  // Example: Add password hashing logic here if needed

  next();
});
