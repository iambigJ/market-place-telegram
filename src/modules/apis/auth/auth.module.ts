import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JWTModule } from '../../../shared/jwt-config/jwt-module';
import { AuthController } from './auth.controller';
import { MailModule } from '../../../shared/mailer/mailer.module';

@Module({
  imports: [JWTModule, UsersModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
