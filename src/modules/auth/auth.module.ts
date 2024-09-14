import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JWTModule } from '../../common/jwt-config/jwt-module'; // Assuming you have a UsersModule
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local-strategy';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [UsersModule, PassportModule, JWTModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
