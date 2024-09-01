import {  Injectable } from '@nestjs/common';
import { MyLogger } from '../../shared/loggercustom';
import { UserRepository } from './user.repository';
import {CacheService} from "../cache/redis-service";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  private readonly logger = new MyLogger(this.constructor.name);
  private cache : CacheService

  constructor(
    private readonly userRepository: UserRepository,
  ) {}
  boot(cache : CacheService){
    this.cache = cache
  }
  async createUser(createUserDto: CreateUserDto){}
}
