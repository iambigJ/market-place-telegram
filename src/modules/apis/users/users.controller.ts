import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Request } from 'express';
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Body() user: CreateUserDto, @Param('id') id: string) {
    return await this.userService.update(id, user);
  }
  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getUser(@Req() req: Request) {
    return await this.userService.findByTelegramId(req['user']);
  }
}
