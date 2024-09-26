import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IS_PUBLIC_KEY,
  IS_VERIFY_EMAIL,
} from '../modules/auth/auth.controller';
import { Request as RequestType } from 'express';
import { CacheService } from '../common/cache/redis-service';
import { AuthPrefix } from '../common/prefixes/global-prefix';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const isVerifyEmail = this.reflector.getAllAndOverride<boolean>(
        IS_VERIFY_EMAIL,
        [context.getHandler(), context.getClass()],
      );
      if (isVerifyEmail) return true;
      if (!payload || !payload.email || !payload.teleId) {
        throw new UnauthorizedException();
      }
      const user = await this.cacheService.get(
        [AuthPrefix, payload.teleId].join('.'),
      );
      if (
        !user ||
        user.email !== payload.email ||
        user.teleId !== payload.teleId
      ) {
        throw new UnauthorizedException();
      }
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: RequestType): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
