import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CustomReturnResponse<T> {
  data: T;
}

@Injectable()
export class ResponseFormattingInterceptor<T>
  implements NestInterceptor<T, CustomReturnResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<CustomReturnResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        status: context.switchToHttp().getResponse<Response>().statusCode,
      })),
    );
  }
}
