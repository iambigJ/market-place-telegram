import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CacheService } from '../../common/cache/redis-service';
import { UsersService } from './users.service';
import { AuthGuard } from '../../guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private cache: CacheService,
    private userService: UsersService,
  ) {}
  @Post('update/:id')
  @UseGuards(AuthGuard)
  async update(@Body() user: CreateUserDto, @Param('id') id: string) {
    return await this.userService.update(id, user);
  }
  @Post('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
