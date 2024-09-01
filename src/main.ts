import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {UserRepository} from "./modules/users/user.repository";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      skipUndefinedProperties: true,
      skipNullProperties: true,
      skipMissingProperties: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.enableCors();
    app.get(UserRepository).ok()
    app.get(UserRepository).ok2()
  await app.listen(3000);
}
bootstrap();
