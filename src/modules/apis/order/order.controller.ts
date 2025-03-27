import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.schema';
import { OrderItemDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createOrderDto: OrderItemDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(): Promise<Order[]> {
    return;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: Partial<Order>,
  ): Promise<Order> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<Order> {
    return this.orderService.remove(id);
  }
}
