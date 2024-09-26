import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CacheService } from '../../common/cache/redis-service';
import { MailerService } from '@nestjs-modules/mailer';
import { MyLogger } from '../../common/custom-logger/custom-logger';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  private static prefix: string = 'teleBot';
  private readonly logger = new MyLogger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private cache: CacheService,
    private mailService: MailerService,
  ) {}

  async login(user: LoginDto) {
    const userRef = await this.usersService.findByCondition({
      user: user.email,
      email: user.password,
    });
    if (!userRef) throw new NotFoundException('user not found');
    if (userRef.active == false)
      throw new UnprocessableEntityException('user not verified');
    const payload = { username: userRef.email, sub: user.password };
    await this.cache.set([AuthService.prefix, userRef.telegramId].join('.'), {
      email: userRef.email,
      teleId: userRef.telegramId,
      role: userRef.role,
    });
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verify(verify: string) {
    const result = await this.jwtService.verifyAsync(verify);
    if (result && result?.state == 'no verified') {
      let user = await this.cache.get(
        [AuthService.prefix, result.email].join('.'),
      );
      if (!user) {
        user = await this.usersService.findByCondition(result.teleId);
      }
      if (!user) {
        throw new UnprocessableEntityException('user not found');
      }
      await this.usersService.updateStatus({
        active: true,
      });
      this.cache
        .delete([AuthService.prefix, result.email].join('.'))
        .catch((e) => {
          this.logger.error('error deleting cache', e);
        });
      return user;
    }
  }

  async signUp(user: CreateUserDto) {
    try {
      user.password = await bcrypt.hash(user.password, 10);
      const newUser = await this.usersService.create(user);
      if (!newUser) throw new UnprocessableEntityException('user not created');
      await this.cache.set([AuthService.prefix, newUser.email].join('.'), {
        state: 'no verified',
      });
      const token = this.jwtService.sign({
        email: newUser.email,
        teleId: newUser.telegramId,
        state: 'no verified',
      });
      await this.sendEmail(newUser.email, token);
    } catch (e) {
      throw new InternalServerErrorException('ErrorSendEmail');
    }
  }

  async sendEmail(email: string, token: string) {
    await this.mailService
      .sendMail({
        to: email,
        from: 'testi@email.com',
        subject: 'verify your account',
        text:
          'click on the link below to verify your account \n http://localhost:3000/auth/verify?verify=' +
          token,
      })
      .then(() => {
        this.logger.debug('email sent successfully', ['email', email]);
      })
      .catch(() => {
        throw new InternalServerErrorException('ErrorSendEmail');
      });
  }

  async sendVerify(email: string) {
    const user = await this.usersService.findByCondition({ email: email });
    if (!user) {
      throw new UnprocessableEntityException('user not found');
    }
    if (user.active) return 'user already verified';
    const token = this.jwtService.sign({
      email: email,
      state: 'no verified',
    });
    return await this.sendEmail(email, token);
  }

  async logout(telegramId: string) {
    await this.cache
      .delete([AuthService.prefix, telegramId].join('.'))
      .catch((e) => {
        this.logger.error('error deleting cache', e);
      });
  }
}
