import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  Min,
  IsEnum,
} from 'class-validator';
import { Types } from 'mongoose';

export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  customerId: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
