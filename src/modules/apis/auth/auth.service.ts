import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CacheService } from '../../../common/cache/redis-service';
import { MailerService } from '@nestjs-modules/mailer';
import { MyLogger } from '../../../common/custom-logger/custom-logger';
import { LoginDto } from './auth.dto';
import { ConfigService } from '@nestjs/config';
import { CachePrefixes } from 'src/shared/prefixes/global-prefix';

interface VerificationTokenPayload {
  teleId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new MyLogger(AuthService.name);
  private readonly verificationLinkBaseUrl: string;
  private readonly fromEmail: string;

  private readonly ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    ACCOUNT_NOT_VERIFIED:
      'User account is not verified. Please check your email.',
    VERIFICATION_TOKEN_MISSING:
      'Invalid verification token: Telegram ID missing.',
    USER_NOT_FOUND: 'User not found for verification.',
    EMAIL_ALREADY_REGISTERED: 'Email already registered and verified.',
    FAILED_SEND_VERIFICATION:
      'Failed to send verification email. Please try again later.',
  };

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private cache: CacheService,
    private mailService: MailerService,
    private configService: ConfigService,
  ) {
    this.verificationLinkBaseUrl = this.configService.get<string>(
      'VERIFICATION_LINK_BASE_URL',
    );
    this.fromEmail =
      this.configService.get<string>('FROM_EMAIL') || 'testi@email.com';
  }

  static createCachePreficAuth(teleId: string) {
    return CachePrefixes.auth.concat('.', teleId);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByConditionWithError({
      email: loginDto.email,
    });

    // if (!user.active) {
    //   throw new UnprocessableEntityException(
    //     this.ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
    //   );
    // }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) {
      throw new NotFoundException(this.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const payload = {
      teleId: user.telegramId,
      role: user.role,
    };

    await this.cache.set(AuthService.createCachePreficAuth(user.telegramId), {
      teleId: user.telegramId,
      role: user.role,
      productLimit: user.productLimit,
      categoryLimit: user.categoryLimit,
    });

    return {
      access_token: this.jwtService.sign(payload, { secret: 'shapalakh' }),
    };
  }

  async verify(token: string) {
    let decodedToken: VerificationTokenPayload;
    try {
      decodedToken =
        await this.jwtService.verifyAsync<VerificationTokenPayload>(token);
    } catch (error) {
      const message =
        error.name === 'TokenExpiredError'
          ? 'Invalid or expired verification token.'
          : 'Failed to verify token.';
      throw new UnauthorizedException(message);
    }

    if (!decodedToken?.teleId) {
      throw new UnauthorizedException(
        this.ERROR_MESSAGES.VERIFICATION_TOKEN_MISSING,
      );
    }

    const user = await this.usersService.findByConditionWithError({
      telegramId: decodedToken.teleId,
    });
    if (!user) {
      throw new UnprocessableEntityException(
        this.ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    if (user.active) {
      return { message: 'Account already verified.' };
    }

    await this.usersService.updateStatus(user?.telegramId, { active: true });
    await this.deleteCache(user.telegramId);

    return { message: 'Account verified successfully.' };
  }

  async signUp(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.usersService.findByCondition({
        email: createUserDto.email,
      });

      if (existingUser) {
        throw new UnprocessableEntityException(
          this.ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED,
        );
      }

      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      const newUser = await this.usersService.create(createUserDto);

      // this.sendEmailVerificationLink(
      //   newUser.email,
      //   this.generateVerificationToken(newUser.telegramId),
      // ).catch((e) => {
      //   this.logger.error('error send email verification', e);
      // });
      return {
        data: newUser,
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      this.logger.error('Error during signup', error?.stack);
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to complete signup. Please try again later.',
      );
    }
  }

  async sendVerify(email: string) {
    const user = await this.usersService.findByConditionWithError({ email });
    if (!user) {
      throw new UnprocessableEntityException(
        this.ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    if (user.active) {
      return { message: 'Account is already verified.' };
    }

    await this.sendEmailVerificationLink(
      email,
      this.generateVerificationToken(user.telegramId),
    );
    return {
      message:
        'Verification email resent successfully. Please check your inbox.',
    };
  }

  async logout(telegramId: string) {
    await this.deleteCache(telegramId);
    return { message: 'Logged out successfully.' };
  }

  private generateVerificationToken(teleId: string): string {
    return this.jwtService.sign({ teleId });
  }

  private async deleteCache(telegramId: string): Promise<void> {
    try {
      await this.cache.delete(telegramId);
    } catch (error) {
      this.logger.error('Error deleting cache', { error, telegramId });
    }
  }

  private async sendEmailVerificationLink(email: string, token: string) {
    const verificationLink = `${this.verificationLinkBaseUrl}/auth/verify?token=${token}`;

    try {
      await this.mailService.sendMail({
        to: email,
        from: this.fromEmail,
        subject: 'Verify your account - Action Required',
        html: this.getVerificationEmailTemplate(verificationLink),
      });
      this.logger.debug('Verification email sent successfully', { email });
    } catch (error) {
      this.logger.error('Error sending verification email', { error, email });
      throw new InternalServerErrorException(
        this.ERROR_MESSAGES.FAILED_SEND_VERIFICATION,
      );
    }
  }

  private getVerificationEmailTemplate(verificationLink: string): string {
    return `
      <p>Dear user,</p>
      <p>Please click on the following link to verify your account:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>This link will expire in a short time. If you did not sign up for this account, you can ignore this email.</p>
      <p>Thanks,</p>
      <p>Your Application Team</p>
    `;
  }
}
