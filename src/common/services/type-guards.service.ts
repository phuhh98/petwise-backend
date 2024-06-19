import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeGuards {
  isError(data: any): data is Error {
    return data instanceof Error;
  }
}
