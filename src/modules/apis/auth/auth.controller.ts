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
import { AuthGuard } from '../../../common/guards/jwt-auth.guard';
import { LoginDto } from './auth.dto';


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
  @UseGuards(AuthGuard)
  async sendVerify(@Param('email') email: string) {
    return await this.authService.sendVerify(email);
  }

  @Post('verify')
  async verify(@Query('token') token: string) {
    return await this.authService.verify(token);
  }

  @Post('logout/:id')
  @UseGuards(AuthGuard)
  async logout(@Param('id') id: string) {
    await this.authService.logout(id);
    return 'logout success';
  }
}
