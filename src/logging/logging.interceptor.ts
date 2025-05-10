import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap(async (responseBody) => {
        const duration = `${Date.now() - startTime} milliseconds`;
        
        // Get user ID from JWT if available
        const user = request.user as { id: string } | undefined;
        
        await this.loggingService.logRequest({
          method: request.method,
          url: request.url,
          headers: request.headers,
          query: request.query,
          body: request.body,
          response: responseBody,
          statusCode: response.statusCode,
          ipAddress: request.ip,
          userAgent: request.get('user-agent'),
          userId: user?.id,
          duration,
        });
      }),
    );
  }
}