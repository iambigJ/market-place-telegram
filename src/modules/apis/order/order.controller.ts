// order.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.schema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: Partial<Order>): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  async findAll(): Promise<Order[]> {
    return;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) a: string,
  ): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: Partial<Order>,
  ): Promise<Order> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Order> {
    return this.orderService.remove(id);
  }
}
