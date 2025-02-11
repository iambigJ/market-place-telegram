import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MyLogger } from '../common/custom-logger/custom-logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new MyLogger('Global');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const ip = req.ip;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${ip} ${responseTime}ms`,
      );
    });

    next();
  }
}
