import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TravelAssitantQueryDto {
  @IsString()
  question: string;
}

export class EmbeddingMultiFileUploadDtoSwagger {
  @ApiProperty({ format: 'binary', type: 'string' })
  files: any;
}

export class EmbeddingUploadBodyDto {
  @IsString()
  subject: string;
}
