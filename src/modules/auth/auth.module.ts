import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JWTModule } from '../../common/jwt-config/jwt-module';
import { AuthController } from './auth.controller';
import { MailModule } from '../../common/mailer.module';

@Module({
  imports: [UsersModule, JWTModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
