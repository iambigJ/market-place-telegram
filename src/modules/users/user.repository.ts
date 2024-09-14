import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { MyLogger } from '../../common/custom-logger/custom-logger';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // Ensure UserDocument is imported correctly
import { Cache } from 'cache-manager';
import { CacheService } from '../../common/cache/redis-service';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

const noStrict = {
  strict: false,
  upsert: false,
  timestamps: true,
};

@Injectable()
export class UserRepository {
  private readonly logger = new MyLogger(UserRepository.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.userModel.create(createUserDto);
  }
  //
  // // Update an existing user by ID
  async updateUser(createUserDto: any): Promise<User | null> {
    return await this.userModel.findByIdAndUpdate(
      createUserDto.objectId,
      createUserDto,
      noStrict,
    );
  }
  //
  // // Find a user by ID
  // async findUserById(id: string): Promise<User | null> {
  //   return await this.userModel.findById(id).exec();
  // }
  //
  // // Find a user by ID and update
  // async findByIdAndUpdate(id: string, updateDto: any): Promise<User | null> {
  //   return await this.userModel.findByIdAndUpdate(id, updateDto, noStrict);
  // }
  //
  // // Retrieve all users
  // async findAllUsers(): Promise<User[]> {
  //   return await this.userModel.find().exec();
  // }
  //
  // // Delete a user by ID
  // async deleteUser(id: string): Promise<User | null> {
  //   return await this.userModel.findByIdAndDelete(id).exec();
  // }
  //
  // async findUserByCriteria(criteria: any): Promise<User | null> {
  //   return await this.userModel.findOne(criteria).exec();
  // }
}
