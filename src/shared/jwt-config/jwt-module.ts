import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTConfig } from '../config/config.validation';
import { readFile } from 'fs/promises';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<JWTConfig>('JWT_Config'); // Reading the file name from the config service
        const secretFile = await readFile(config.Key_Path, 'utf8'); // Reading the file asynchronously
        return {
          isGlobal: true,
          secret: secretFile.trim(), // Use the trimmed secret from the file
          signOptions: { expiresIn: '24h' }, // JWT expiration
        };
      },
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JWTModule {}
