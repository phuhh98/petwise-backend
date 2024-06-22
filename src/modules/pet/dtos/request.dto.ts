import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { PetEntity } from 'src/common/entities/pet.entity';

export class CreatePetDto extends IntersectionType(
  PickType(PetEntity, ['name']),
  PartialType(PickType(PetEntity, ['user_id', 'bio', 'profile'])),
) {}

class AllowedToUpdate extends PickType(PetEntity, ['name', 'bio', 'profile']) {}
export class UpdatePetDto extends IntersectionType(
  PartialType(AllowedToUpdate),
) {}
