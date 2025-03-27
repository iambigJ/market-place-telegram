// order.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model } from 'mongoose';
import { OrderItemDto } from './dto/create-order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(orderData: OrderItemDto): Promise<Order> {
    const createdOrder = new this.orderModel(orderData);
    return createdOrder.save();
  }

  async findOrder() {
    return this.orderModel
      .findOne({ telegramId: 1 })
      .populate('products')
      .exec();
  }

  async findByTeleId(id: string): Promise<Order[]> {
    return this.orderModel.find({}).exec();
  }

  async findById(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    return this.orderModel
      .findByIdAndUpdate(id, orderData, { new: true })
      .exec();
  }

  async deleteOrder(id: string): Promise<Order> {
    return this.orderModel.findByIdAndDelete(id).exec();
  }
}
