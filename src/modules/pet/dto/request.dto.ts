import { OmitType, PartialType } from '@nestjs/swagger';
import { Pet } from './pet.dto';

export class CreatePetDto extends OmitType(Pet, ['id', 'avatar']) {}

export class UpdatePetDto extends PartialType(
  OmitType(CreatePetDto, ['user_id']),
) {}
