import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  await app.listen(app.get(ConfigService).get<string>('port')).then(() => {
    console.log('We Are the Servants The Soul Of  Binary');
  });
}

bootstrap()