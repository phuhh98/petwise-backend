import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';

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
  }
}

export class DiaryEntity {
  @IsObject()
  @ValidateNested()
  @Type(() => DiaryNS.DiaryGeneratedAnalysis)
  analysis: DiaryNS.DiaryGeneratedAnalysis;

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
