import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { UploadedFileDto } from 'src/common/dto/uploaded-file.dto';
import {
  IDiary,
  PetDiaryNS,
} from 'src/interfaces/entities/pet-diary.interface';

export namespace DiaryDtoNS {
  class Emotion implements PetDiaryNS.IPetEmotion {
    @IsString()
    description: string;

    @IsString()
    primary_emotion: string;

    @IsArray()
    @IsString({ each: true })
    secondary_emotions: string[];
  }

  export class DiaryGeneratedAnalysis
    implements PetDiaryNS.IPetDiaryGenaratedAnalysis
  {
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

export class Diary implements IDiary {
  @ValidateNested()
  @Type(() => UploadedFileDto)
  image: UploadedFileDto;

  @IsString()
  id: string;

  @IsString()
  pet_id: string;

  @IsString()
  user_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DiaryDtoNS.DiaryGeneratedAnalysis)
  analysis: DiaryDtoNS.DiaryGeneratedAnalysis;
}
