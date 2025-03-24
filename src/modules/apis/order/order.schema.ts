import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/entities/user.schema';
import { Product } from '../product/product.schema';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true, type: Types.ObjectId, ref: Product.name })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, default: 1, min: 1 })
  quantity: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
@Schema({ timestamps: true, strict: 'throw' })
export class Order {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: User.name,
    index: true,
  })
  customerId: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem;

  @Prop({ required: true, type: Types.ObjectId, ref: Product.name })
  productId: Types.ObjectId;

  @Prop({
    required: true,
    default: 'pending',
    enum: OrderStatus,
    index: true,
  })
  status: string;

  @Prop({ type: String, index: true })
  sellers: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
