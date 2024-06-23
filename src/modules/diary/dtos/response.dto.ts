import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';
import { RouteHandlerReturn } from 'src/common/dtos/route-handler-return.dto';
import { DiaryEntity } from 'src/common/entities/diary.entity';

export class CreatDiaryResDto extends RouteHandlerReturn {
  @ValidateNested()
  @Type(() => DiaryEntity)
  diary: DiaryEntity;
}

export class UpdateDiaryResDto extends CreatDiaryResDto {}

export class GetDiaryResDto extends CreatDiaryResDto {}

export class DeleteDiaryResDto extends RouteHandlerReturn {}

class ListDiaryItems extends FindManyReturnFormatDto<DiaryEntity> {
  @ValidateNested({ each: true })
  @Type(() => DiaryEntity)
  items: DiaryEntity[];
}

export class ListDiaryResDto extends RouteHandlerReturn {
  @ValidateNested()
  @Type(() => ListDiaryItems)
  diaries: ListDiaryItems;
}
PickType;

export class UploadImageResDto extends RouteHandlerReturn {
  @ValidateNested()
  @Type(() => CreatDiaryResDto)
  data: CreatDiaryResDto;
}
