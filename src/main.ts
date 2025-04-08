import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      enableDebugMessages: true,
      skipUndefinedProperties: false,
      skipNullProperties: false,
      skipMissingProperties: false,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  await app.listen(3003).then(() => {
    console.log('We Are the Servants The Soul Of  Binary');
  });
}

bootstrap()