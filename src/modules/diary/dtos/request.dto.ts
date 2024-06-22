import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { DiaryEntity } from 'src/common/entities/diary.entity';

export class CreateDiaryDto extends IntersectionType(
  PickType(DiaryEntity, ['pet_id', 'analysis']),
  PartialType(PickType(DiaryEntity, ['user_id'])),
) {}

export class UpdateDiaryDto extends PickType(DiaryEntity, ['analysis']) {}

export class ListDiaryDto extends PickType(DiaryEntity, ['pet_id']) {}
