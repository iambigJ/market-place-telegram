import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {AuthService} from "./modules/apis/auth/auth.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      skipUndefinedProperties: false,
      skipNullProperties: false,
      skipMissingProperties: false,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();
  await app.listen(3003);
}
bootstrap();
