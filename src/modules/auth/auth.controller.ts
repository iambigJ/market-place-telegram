import {
  Body,
  Controller,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @Post('signIn')
  async signIn(@Body() user: CreateUserDto) {
    return this.authService.signUp(user);
  }

  @Post('verify')
  async verify(@Query('verify') verify: string) {
    return await this.authService.verify(verify);
  }
}
