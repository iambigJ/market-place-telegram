// // order.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';
//
// export type OrderDocument = Order & Document;
//
// @Schema({ _id: false })
// export class OrderItem {
//   @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
//   productId: Types.ObjectId;
//
//   @Prop({ required: true, default: 1 })
//   quantity: number;
// }
// export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
//
// @Schema({ timestamps: true, strict: 'throw' })
// export class Order {
//
//   @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
//   customerId: Types.ObjectId;
//
//   @Prop({ type: [OrderItemSchema], default: [] })
//   items: OrderItem[];
//
//   @Prop({ required: true, default: 'pending' })
//   status: string;
//
//   @Prop({ required: true, default: 0 })
//   total: number;
// }
//
// export const OrderSchema = SchemaFactory.createForClass(Order);
