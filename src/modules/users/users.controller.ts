import {
  ArgumentMetadata,
  Body,
  Controller,
  Injectable,
  PipeTransform,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CacheService } from '../../common/cache/redis-service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private cache: CacheService,
    private userService: UsersService,
  ) {}

  @Post()
  async signup(@Query('id') id: string, @Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return await this.userService.create(createUserDto);
  }

}
