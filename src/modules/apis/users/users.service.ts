import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MyLogger } from '../../../common/custom-logger/custom-logger';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { CacheService } from '../../../common/cache/redis-service';
import { CacheUser } from 'src/common/types/cache-user.type';
import { createCachePreficAuth } from 'src/common/cache/cache-prefixes';

export interface ITelegramUserCreate {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class UsersService {
  private logger = new MyLogger(UsersService.name);
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('RedisCacheService') private cacheService: CacheService,
  ) {}

  async updateProductLimit(telegramId: string) {
    await this.cacheService
      .get(createCachePreficAuth(telegramId))
      .then(async (item) => {
        if (item) {
          await this.cacheService.set(createCachePreficAuth(telegramId), {
            ...item,
            productLimit: item.productLimit - 1,
          });
        }
      });
    await this.userRepository.updateProductLimit(telegramId).catch((e) => {
      this.logger.error('error update product limit', e?.stack);
      throw new BadRequestException('UpdateProductLimit');
    });
  }

  createByTelegram(user: ITelegramUserCreate) {
    try {
      return this.userRepository.createUser({
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      } as any);
    } catch (e) {
      this.logger.error('error create user', e?.stack, e?.message);
      throw new BadRequestException('BadRequest');
    }
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
  async findByTeleId(telegramId: string) {
    return await this.userRepository
      .findByCondition({
        telegramId,
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
