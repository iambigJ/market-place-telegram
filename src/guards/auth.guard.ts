import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CacheService } from '../common/cache/redis-service';
import { JwtService } from '@nestjs/jwt';

interface UserTmpSession {
  id: string;
  expire: string; // Assuming this is a string representing a timestamp
  isActive: string; // Assuming this is a string, e.g., "true" or "false"
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly cache: CacheService,
    private readonly auth: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = (await this.auth.verifyAsync(token)) as UserTmpSession;
      const session = (await this.cache.get(payload.id)) as Omit<
        UserTmpSession,
        'id'
      >;

      // If session exists, ensure it's active and not expired
      if (session && this.isSessionValid(session)) {
        return true;
      } else {
        throw new UnauthorizedException('Session is not valid or has expired');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isSessionValid(session: Omit<UserTmpSession, 'id'>): boolean {
    // Convert expire to a number if it's a string
    const expireTimestamp = parseInt(session.expire, 10);

    // Check if the session is still active and not expired
    return (
      !isNaN(expireTimestamp) &&
      expireTimestamp > Date.now() &&
      session.isActive === 'true'
    );
  }
}
