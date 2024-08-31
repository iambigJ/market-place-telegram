import { Body, Controller, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor() {
  }
  @Post('/shapalakh')
  async signup(@Body() createUserDto: CreateUserDto, @Query('id') id: string) {
    console.log(id);
    console.log(createUserDto);
    return 'ok';
  }
}
