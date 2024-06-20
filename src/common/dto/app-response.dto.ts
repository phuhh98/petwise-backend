import { ApiProperty } from '@nestjs/swagger';

export class GenericSuccessResponseDto<TData> {
  @ApiProperty()
  message: string;

  @ApiProperty()
  data: TData;

  @ApiProperty()
  status: number;
}

export class ErrorResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;

  @ApiProperty()
  status: number;
}
