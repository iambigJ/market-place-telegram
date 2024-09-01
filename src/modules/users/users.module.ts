import { Module, OnModuleInit } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';
import { CacheService } from '../cache/redis-service';
import {UsersService} from "./users.service";

@Module({
  imports: [],
  providers: [UserRepository,UsersService],
  controllers: [UsersController],
})
export class UsersModule implements OnModuleInit {
  constructor(private cacheSerivce: CacheService, private userService: UsersService) {}

  onModuleInit(): void {
    this.cacheSerivce.boot('telekala_users');
    this.userService.boot(this.cacheSerivce)
  }
}
