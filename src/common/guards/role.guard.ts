import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache/redis-service';

interface RequestWithUser {
  user?: {
    teleId?: string;
    role?: string;
  };
}

const Roles = Reflector.createDecorator();

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name); // Logger for better logging

  constructor(
    private reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      Roles,
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = await this.cacheService.get(req.user?.teleId);

    if (!req.user?.teleId) {
      this.logger.warn(
        'No teleId found in request user object. Authentication might be missing.',
      );
      throw new UnauthorizedException('Authentication required.');
    }

    if (!user) {
      this.logger.warn(
        `User with teleId: ${req.user?.teleId} not found in cache.`,
      );
      throw new UnauthorizedException('User session not found.');
    }

    if (!user.role) {
      this.logger.warn(
        `User with teleId: ${req.user?.teleId} has no role defined.`,
      );
      throw new UnauthorizedException('User role is not defined.');
    }

    const userRole = user.role;

    const isRoleAllowed = requiredRoles.includes(userRole);

    if (!isRoleAllowed) {
      this.logger.warn(
        `User with role '${userRole}' is not authorized to access this feature. Required roles: ${requiredRoles}`,
      );
      throw new UnauthorizedException(
        `Unauthorized: Insufficient role. Required roles: ${requiredRoles.join(', ')}. Your role: ${userRole}`, // More informative message
      );
    }

    return true;
  }
}
