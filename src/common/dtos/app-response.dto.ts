import { ApiProperty } from '@nestjs/swagger';

import { AppStandardReponseDto } from './app-standard-response.dto';

export class SuccessResponseDto<T>
  implements Omit<AppStandardReponseDto<T>, 'error'>
{
  @ApiProperty()
  data: T;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}

export class ErrorResponseDto
  implements Omit<AppStandardReponseDto<null>, 'data'>
{
  @ApiProperty()
  error: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}
