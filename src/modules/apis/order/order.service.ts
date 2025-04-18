// order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order } from './order.schema';
import { OrderItemDto } from './dto/create-order.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private productService: ProductService,
  ) {}

  async create(orderData: OrderItemDto): Promise<Order> {
    const productOwnerId = await this.productService.findOne(
      orderData.productId,
    );
    return this.orderRepository.createOrder({
      ...orderData,
      ownerId: productOwnerId.ownerId,
    });
  }

  // async findAll(teleId: string): Promise<Order[]> {
  //   return this.orderRepository.findByTeleId();
  // }

  async findWithProduct(buyerId: string) {
    try {
      const orders = await this.orderRepository.findBuyerId(buyerId);
      const ordersWithProduct = [];
      for (const order of orders) {
        const product = await this.productService.findOne(order.productId);
        order['product'] = product.toObject();
        ordersWithProduct.push(order);
      }
      console.log(ordersWithProduct);
      return ordersWithProduct;
    } catch (error: any) {
      console.log(error);
      throw new NotFoundException(`Order with product id ${buyerId} not found`);
    }
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
