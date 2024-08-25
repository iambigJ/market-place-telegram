import {  Injectable } from '@nestjs/common';
import { MyLogger } from '../../shared/loggercustom';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  private readonly logger = new MyLogger(this.constructor.name);

  constructor(private readonly userRepository: UserRepository) {}
}
