import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { IPet, PetProfileNS } from 'src/types/pet.type';
import { Type } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/swagger';

export namespace PetProfileDtoNS {
  class PetCoatingDto implements PetProfileNS.IPetCoating {
    @IsString()
    colors: string;

    @IsString()
    type: string;
  }

  class PetHeadDto implements PetProfileNS.IPetHead {
    @IsString()
    ears: string;

    @IsString()
    eyes: string;

    @IsString()
    nose: string;

    @IsString()
    shape: string;
  }

  class PetBodyDto implements PetProfileNS.IPetBody {
    @IsString()
    build: string;

    @IsString()
    tail: string;
  }

  class PetHealthDto implements PetProfileNS.IPetHealth {
    @IsString()
    commonHealthIssues: string;

    @IsString()
    lifespan: string;
  }

  class PetGroomingDto implements PetProfileNS.IPetGrooming {
    @IsString()
    bathing: string;

    @IsString()
    frequency: string;
  }
  class PetExerciseDto implements PetProfileNS.IPetExercise {
    @IsString()
    needs: string;

    @IsString()
    suitableFor: string;
  }

  class PetTemperamentDto implements PetProfileNS.IPetTemperament {
    @IsString()
    barkingTendency: string;

    @IsString()
    energyLevel: string;

    @IsString()
    personality: string;

    @IsString()
    trainability: string;
  }

  class PetAppearanceDto implements PetProfileNS.IPetAppearance {
    @IsString()
    size: string;

    @ValidateNested()
    @Type(() => PetCoatingDto)
    coat: PetCoatingDto;

    @ValidateNested()
    @Type(() => PetHeadDto)
    head: PetHeadDto;

    @ValidateNested()
    @Type(() => PetBodyDto)
    body: PetBodyDto;

    @IsString()
    legs: string;
  }

  export class PetProfileDto implements PetProfileNS.IPetProfile {
    @IsString()
    type: string;

    @IsString()
    breed: string;

    @IsString()
    description: string;

    @ValidateNested()
    @Type(() => PartialType(PetAppearanceDto))
    appearance: PetAppearanceDto;

    @ValidateNested()
    @Type(() => PartialType(PetTemperamentDto))
    temperament: PetTemperamentDto;

    @ValidateNested()
    @Type(() => PartialType(PetHealthDto))
    health: PetHealthDto;

    @ValidateNested()
    @Type(() => PartialType(PetGroomingDto))
    grooming: PetGroomingDto;

    @ValidateNested()
    @Type(() => PartialType(PetExerciseDto))
    exercise: PetExerciseDto;
  }
}

export class Pet implements IPet {
  id: string;

  user_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartialType(PetProfileDtoNS.PetProfileDto))
  profile?: PetProfileDtoNS.PetProfileDto;
}

export class CreatePetDto implements IPet {
  id: string;

  user_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartialType(PetProfileDtoNS.PetProfileDto))
  profile?: PetProfileDtoNS.PetProfileDto;
}

export class UpdatePetDto extends PartialType(
  OmitType(CreatePetDto, ['user_id']),
) {}