import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { UsersService } from './modules/users/users.service';
import { MyLogger } from './common/custom-logger/custom-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      skipUndefinedProperties: false,
      skipNullProperties: false,
      skipMissingProperties: false,
      forbidNonWhitelisted: false,
    }),
  );
  app.enableCors();

  setTimeout(() => {
    app.get(UsersService).test();
  });

  await app.listen(3003);
}
bootstrap();
