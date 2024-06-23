import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { DiaryEntity } from 'src/common/entities/diary.entity';

export class CreateDiaryDto extends IntersectionType(
  PickType(DiaryEntity, ['pet_id', 'analysis']),
  PartialType(PickType(DiaryEntity, ['user_id', 'diary_date'])),
) {}

export class UpdateDiaryDto extends IntersectionType(
  PickType(DiaryEntity, ['analysis']),
  PartialType(PickType(DiaryEntity, ['diary_date'])),
) {}
