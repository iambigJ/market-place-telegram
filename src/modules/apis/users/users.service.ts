import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MyLogger } from '../../../common/custom-logger/custom-logger';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { CacheService } from '../../../common/cache/redis-service';
import { CacheUser } from 'src/common/types/cache-user.type';
import { Param } from '@nestjs/common';

@Injectable()
export class UsersService {
  private logger = new MyLogger(UsersService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private cacheService: CacheService,
  ) {}

  async updateProductLimit(telegramId: string) {
    this.cacheService.get(telegramId).then((item) => {
      if (item) {
        this.cacheService.hset(
          telegramId,
          'productLimit',
          (item['productLimit'] || 0) + 1,
        );
      }
    });
    await this.userRepository.updateProductLimit(telegramId).catch((e) => {
      this.logger.error('error update product limit', e?.stack);
      throw new BadRequestException('UpdateProductLimit');
    });
  }

  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.createUser(createUserDto).catch((e) => {
      this.logger.error('error create user', e?.stack, e?.message);
      throw new BadRequestException('BadRequest');
    });
  }
  async delete(id: string) {
    return await this.userRepository
      .deleteUser(id)
      .then(() => {
        this.cacheService.delete(id);
      })
      .catch((e) => {
        this.logger.error('error delete user', e?.stack, e?.message);
        throw new BadRequestException('DeleteUser');
      });
  }

  async updateStatus(id: string, updateUser: { active: boolean }) {
    return await this.userRepository
      .findByIdAndUpdate(id, updateUser)
      .catch((e) => {
        throw new BadRequestException('UpdateUserFailed', e?.message);
      });
  }
  async update(id: string, updateUser: CreateUserDto) {
    return await this.userRepository.updateUser(id, updateUser).catch((e) => {
      throw new BadRequestException('UpdateUserFailed');
    });
  }

  async findByTelegramId(user: CacheUser) {
    return await this.userRepository
      .findByCondition({
        telegramId: user.teleId,
      })
      .then((user) => {
        if (!user) {
          throw new NotFoundException('UserNotFound');
        }
        return user;
      })
      .catch((e) => {
        this.logger.error('error find user', e?.stack);
        throw new BadRequestException(e?.message);
      });
  }

  async findById(id: string) {
    return await this.userRepository.findUserById(id).catch((e) => {
      this.logger.error('error find user', e?.stack, e?.message);
      throw new BadRequestException('UserNotFound');
    });
  }

  async findByConditionWithError(condition: Record<any, any>) {
    return await this.userRepository
      .findByCondition(condition)
      .then((user) => {
        if (!user) {
          throw new NotFoundException('UserNotFound');
        }
        return user;
      })
      .catch((e) => {
        this.logger.error('error find user', e?.stack);
        throw new BadRequestException(e?.message);
      });
  }
  async findByCondition(condition: Record<any, any>) {
    return await this.userRepository.findByCondition(condition).catch((e) => {
      this.logger.error('error find user', e?.stack);
      throw new BadRequestException(e?.message);
    });
  }
}
