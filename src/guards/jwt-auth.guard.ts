import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CacheService } from '../common/cache/redis-service';
import { AuthPrefix } from '../common/prefixes/global-prefix';


export interface RequestWithUser extends Request {
  user?: any; // Replace `any` with a more specific type if available.
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
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload) {
        throw new UnauthorizedException();
      }

      const { email, teleId } = payload as { email?: string; teleId?: string };
      if (!email || !teleId) {
        throw new UnauthorizedException();
      }

      const user = await this.cacheService.get(`${AuthPrefix}.${teleId}`);
      if (!user || user.email !== email || user.teleId !== teleId) {
        throw new UnauthorizedException();
      }

      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
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
