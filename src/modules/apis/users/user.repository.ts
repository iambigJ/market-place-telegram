import { Injectable } from '@nestjs/common';
import { MyLogger } from '../../../common/custom-logger/custom-logger';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  private readonly logger = new MyLogger(UserRepository.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  async updateProductLimit(telegramId: string): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate(
        { telegramId },
        { $inc: { productLimit: -1 } },
        { new: true },
      )
      .exec();
  }

  async findByCondition(condition: Record<any, any>): Promise<User | null> {
    return this.userModel.findOne({ ...condition }).exec();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdAndUpdate(id: string, updateDto: any): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateDto);
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async updateUser(id: string, updateDto: CreateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateDto);
  }
  async updateStatus(id: string, updateDto: { active: boolean }) {
    return this.userModel.findByIdAndUpdate(id, { active: updateDto.active });
  }
  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findAndDelete(condition: Record<any, any>): Promise<User | null> {
    return this.userModel.findOneAndDelete({ ...condition }).exec();
  }
}
