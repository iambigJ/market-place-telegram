import { BadRequestException, Injectable } from '@nestjs/common';
import { MyLogger } from '../../common/custom-logger/custom-logger';
import { UserRepository } from './user.repository';
import { CacheService } from '../../common/cache/redis-service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new MyLogger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private cache: CacheService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.createUser(createUserDto).catch(() => {
      throw new BadRequestException('BadRequest');
    });
  }

  async update(updateUser: UpdateUserDto) {
    return await this.userRepository.updateUser(updateUser);
  }
}
