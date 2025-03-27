import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CacheService } from '../cache/redis-service';
import { AuthService } from 'src/modules/apis/auth/auth.service';
import { UserCache } from '../cache/global-prefix';
import { ConfigService } from '@nestjs/config';

export interface RequestWithUser extends Request {
  user?: any;
}

interface JwtPayload {
  teleId: string;
  role?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.get('JWT_KEY'),
      });
      console.log(payload);
      if (!payload || !payload.teleId) {
        throw new UnauthorizedException('Invalid token payload');
      }
      const { teleId } = payload;

      const user = (await this.cacheService.get(
        AuthService.createCachePreficAuth(teleId),
      )) as UserCache;
      if (!user || user.teleId !== teleId) {
        throw new UnauthorizedException('Cache not set. Please login again');
      }

      request['user'] = user;
    } catch (err: any) {
      throw new UnauthorizedException(err?.message || 'Unauthorized');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
