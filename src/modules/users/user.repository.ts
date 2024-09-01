import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { MyLogger } from '../../shared/loggercustom';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // Ensure UserDocument is imported correctly
import { Cache } from 'cache-manager';
import {CacheService} from "../cache/redis-service";
import {InjectConnection} from "@nestjs/mongoose";

const noStrict = {
  strict: false,
  upsert: false,
  timestamps: true,
};

@Injectable()
export class UserRepository  {
  private readonly logger = new MyLogger(UserRepository.name);
  constructor() {}

  // async createUser(createUserDto: any): Promise<User> {
  //   const newUser = new this.userModel(createUserDto);
  //   return newUser.save();
  // }
  //
  // // Update an existing user by ID
  // async updateUser(createUserDto: any): Promise<User | null> {
  //   return await this.userModel.findByIdAndUpdate(
  //     createUserDto.objectId, // The ID of the user to update
  //     createUserDto, // The updated data
  //     noStrict, // Return the updated document
  //   );
  // }
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
