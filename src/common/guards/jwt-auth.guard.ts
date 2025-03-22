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

export interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      console.log(token);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'shapalakh',
      });
      if (!payload) {
        throw new UnauthorizedException(
          'can not find any payload for your token',
        );
      }
      const { teleId } = payload as { teleId?: string };
      if (!teleId) {
        throw new UnauthorizedException();
      }

      const user = await this.cacheService.get(
        AuthService.createCachePreficAuth(teleId),
      );
      if (!user || user.teleId !== teleId) {
        throw new UnauthorizedException('cache not set please login again');
      }

      request['user'] = user;
    } catch (er: any) {
      throw new UnauthorizedException(er);
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
