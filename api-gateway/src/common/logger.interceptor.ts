import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.originalUrl;
    const user = req.user?.sub || 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const time = Date.now() - now;
        this.logger.log(`[${method}] ${url} - ${user} - ${time}ms`);
      }),
    );
  }
}
