import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MyLogger } from '../../common/custom-logger/custom-logger';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private logger = new MyLogger(UsersService.name);
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.createUser(createUserDto).catch(() => {
      throw new BadRequestException('BadRequest');
    });
  }
  async delete(id: string) {
    return await this.userRepository.deleteUser(id).catch((e) => {
      throw new BadRequestException('DeleteUser');
    });
  }

  async updateStatus(updateUser: { active: boolean }) {
    return await this.userRepository.updateStatus(updateUser).catch((e) => {
      throw new BadRequestException('UpdateUserFailed');
    });
  }
  async update(id: string, updateUser: CreateUserDto) {
    return await this.userRepository.updateUser(id, updateUser).catch((e) => {
      throw new BadRequestException('UpdateUserFailed');
    });
  }

  async findByCondition(condition: Record<any, any>) {
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
        throw new BadRequestException('BadRequest');
      });
  }
  test() {
    this.logger.error('alij');
  }
}
