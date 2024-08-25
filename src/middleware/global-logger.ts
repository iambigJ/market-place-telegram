import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MyLogger } from '../shared/loggercustom';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new MyLogger('Global');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
      );
    });

    next();
  }
}
