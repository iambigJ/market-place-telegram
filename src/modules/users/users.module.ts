import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import {CacheModule} from "@nestjs/common/cache";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],

      CacheModule.register<RedisClientOptions>({
        store: redisStore,
        host: 'localhost',
        port: 6379,
      }),
    ),
  ],
  providers: [],
  exports: [],
})
export class UsersModule {}
