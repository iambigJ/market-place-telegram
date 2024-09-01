import { Body, Controller, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor() {
  }
  @Post()
  async signup(@Body() createUserDto: CreateUserDto, @Query('id') id: string) {
    console.log(createUserDto);
  }
}
