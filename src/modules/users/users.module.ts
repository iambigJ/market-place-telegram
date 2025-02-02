import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { MyLogger } from '../../common/custom-logger/custom-logger';
import { JWTModule } from '../../common/jwt-config/jwt-module';

@Module({
  imports: [
    JWTModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  providers: [MyLogger, UsersService, UserRepository],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
