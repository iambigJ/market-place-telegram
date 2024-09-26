import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTConfig } from '../../types/config.validation';
import { readFile } from 'fs/promises';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: undefined,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<JWTConfig>('JWT_Config'); // Reading the file name from the config service
        const secretFile = await readFile(config.Key_Path, 'utf8'); // Reading the file asynchronously
        return {
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
