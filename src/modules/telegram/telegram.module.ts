import { Module } from '@nestjs/common';
import { TelegramInit } from './init';
import { UsersModule } from '../apis/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [TelegramInit],
})
export class TelegramModule {}
