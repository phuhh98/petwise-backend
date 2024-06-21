import { ApiProperty } from '@nestjs/swagger';
import { IAppStandardReponseFormat } from 'src/interfaces/response/app-standard-response.interface';

export class SuccessResponseDto<T>
  implements Omit<IAppStandardReponseFormat<T>, 'error'>
{
  @ApiProperty()
  data: T;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}

export class ErrorResponseDto
  implements Omit<IAppStandardReponseFormat<null>, 'data'>
{
  @ApiProperty()
  error: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}
