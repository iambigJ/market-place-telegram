import { BadRequestException, Injectable } from '@nestjs/common';
import { MyLogger } from '../../common/custom-logger/custom-logger';
import { UserRepository } from './user.repository';
import { CacheService } from '../../common/cache/redis-service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new MyLogger('UsersService');

  constructor(
    private readonly userRepository: UserRepository,
    private cache: CacheService,
  ) {}

  async login(createUserDto: CreateUserDto) {
    return await this.userRepository.createUser(createUserDto).catch((e) => {
      throw new BadRequestException('BadReuqest');
    });
  }
}
