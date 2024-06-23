import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';

import { SuccessResponseDto } from './app-response.dto';

export abstract class RouteHandlerReturn extends PickType(SuccessResponseDto, [
  'message',
]) {
  @Exclude()
  @IsString()
  message: string;
}
