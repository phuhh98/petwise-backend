import { Type } from 'class-transformer';
import {
  IsArray,
  IsISO8601,
  IsNumber,
  IsObject,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { BaseEntity } from './base.entity';
import { UploadedFileEntity } from './uploaded-file.entity';

export namespace DiaryNS {
  class Emotion {
    @IsString()
    description: string;

    @IsString()
    primary_emotion: string;

    @IsArray()
    @IsString({ each: true })
    secondary_emotions: string[];
  }

  export class DiaryGeneratedAnalysis {
    @IsArray()
    @IsString({ each: true })
    actions: string[];

    @IsString()
    advice: string;

    @IsObject()
    @ValidateNested()
    @Type(() => Emotion)
    emotions: Emotion;

    @Min(1)
    @Max(10)
    @IsNumber()
    happiness_level: number;
  }
}

export class DiaryEntity extends BaseEntity {
  @IsObject()
  @ValidateNested()
  @Type(() => DiaryNS.DiaryGeneratedAnalysis)
  analysis: DiaryNS.DiaryGeneratedAnalysis;

  /**
   * Date in ISO 8601 format
   */
  @IsISO8601()
  diary_date: string;

  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => UploadedFileEntity)
  image: UploadedFileEntity;

  @IsString()
  pet_id: string;

  @IsString()
  user_id: string;
}
