import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomResponseReturn } from 'src/types/nest-controller-return-format.types';

@Injectable()
export class ResponseFormattingInterceptor<T>
  implements NestInterceptor<T, CustomResponseReturn<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<CustomResponseReturn<T>> {
    return next.handle().pipe(
      map((data) => {
        return {
          message: data.message ?? '',
          data: delete data.message && (data.data ?? data),
          status: context.switchToHttp().getResponse<Response>().statusCode,
        };
      }),
    );
  }
}
