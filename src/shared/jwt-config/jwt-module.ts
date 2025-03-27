import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTConfig } from '../config/config.types';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_KEY'),
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JWTModule {}
