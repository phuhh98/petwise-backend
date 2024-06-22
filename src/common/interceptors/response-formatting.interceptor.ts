import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppStandardReponseDto } from '../dtos/app-standard-response.dto';

@Injectable()
export class ResponseFormattingInterceptor<T>
  implements NestInterceptor<T, AppStandardReponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<AppStandardReponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        const message = data.message?.toString() ?? '';
        return {
          data: delete data.message && (data.data ?? data),
          error: null,
          message,
          status: context.switchToHttp().getResponse<Response>().statusCode,
        };
      }),
    );
  }
}
