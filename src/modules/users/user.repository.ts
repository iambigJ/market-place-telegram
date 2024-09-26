import { Injectable } from '@nestjs/common';
import { MyLogger } from '../../common/custom-logger/custom-logger';

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


  async findByCondition(condition: Record<any, any>): Promise<User | null> {
    return this.userModel.findOne({ ...condition }).exec();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }


  async findByIdAndUpdate(id: string, updateDto: any): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateDto);
  }

  // // Retrieve all users
  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async updateUser(id: string, updateDto: CreateUserDto) {
    return this.userModel.updateOne({ _id: id }, updateDto);
  }
  async updateStatus(updateDto: { active: boolean }) {
    return this.userModel.updateOne({ active: updateDto.active });
  }
  // // Delete a user by ID
  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findAndDelete(condition: Record<any, any>): Promise<User | null> {
    return this.userModel.findOneAndDelete({ ...condition }).exec();
  }
  //
  // async findUserByCriteria(criteria: any): Promise<User | null> {
  //   return await this.userModel.findOne(criteria).exec();
  // }
}
