import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Diary } from './diary.dto';

export class CreateDiaryDto extends IntersectionType(
  OmitType(Diary, ['id', 'user_id', 'image']),
  PartialType(PickType(Diary, ['user_id'])),
) {}

export class UpdateDiaryDto extends PartialType(
  OmitType(Diary, ['id', 'pet_id', 'user_id']),
) {}

export class ListDiaryDto extends PartialType(PickType(Diary, ['pet_id'])) {}
