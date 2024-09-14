import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CacheService } from '../../common/cache/redis-service'; // Assuming you have a UsersService

@Injectable()
export class AuthService {
  private static prefix: string = 'teleBot';
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private cache: CacheService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // const user = await this.usersService.findByUsername(username);
    // if (user && (await bcrypt.compare(pass, user.password))) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verify(verify: string) {
    const result = await this.jwtService.verifyAsync(verify);
    if (result?.id && result?.isOk == true) {
    }
  }

  async signUp(user: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    const newUser = await this.usersService.create(user);
    await this.cache.set([AuthService.prefix, newUser.telegramId].join('.'), {
      state: 'no verified',
    });
    const res = this.jwtService.sign({
      status: `${newUser.telegramId}.forVerified`,
    });
    console.log(res);
  }
}
