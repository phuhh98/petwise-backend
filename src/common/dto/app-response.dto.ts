import { ApiProperty } from '@nestjs/swagger';

export class GenericSuccessResponseDto<TData> {
  @ApiProperty()
  data: TData;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}

export class ErrorResponseDto {
  @ApiProperty()
  error: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}
