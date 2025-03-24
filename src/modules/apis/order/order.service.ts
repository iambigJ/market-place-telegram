// order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order } from './order.schema';
import { OrderItemDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create(orderData: OrderItemDto): Promise<Order> {
    return this.orderRepository.createOrder(orderData);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    const updatedOrder = await this.orderRepository.updateOrder(id, orderData);
    if (!updatedOrder) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return updatedOrder;
  }

  async remove(id: string): Promise<Order> {
    const deletedOrder = await this.orderRepository.deleteOrder(id);
    if (!deletedOrder) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return deletedOrder;
  }
}
