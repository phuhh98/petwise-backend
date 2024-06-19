import { Injectable } from '@nestjs/common';

@Injectable()
export class ErrorValidatorService {
  isError(data: any): data is Error {
    return data instanceof Error;
  }
}
