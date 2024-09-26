import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SetMetadata } from '@nestjs/common';
import { AuthGuard } from '../../guards/jwt-auth.guard';
import { LoginDto } from './auth.dto';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_VERIFY_EMAIL = 'isVerifyEmail';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
const veryfyEmail = () => SetMetadata(IS_VERIFY_EMAIL, true);

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() user: LoginDto) {
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() user: CreateUserDto) {
    return this.authService.signUp(user);
  }
  @Post('send-verify')
  @Public()
  @UseGuards(AuthGuard)
  async sendVerify(@Param('email') email: string) {
    return await this.authService.sendVerify(email);
  }

  @Post('verify')
  async verify(@Query('context') verify: string) {
    return await this.authService.verify(verify);
  }

  @Post('logout/:id')
  @UseGuards(AuthGuard)
  async logout(@Param('id') id: string) {
    await this.authService.logout(id);
    return 'logout success';
  }
}
