import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { UploadedFileDto } from 'src/common/dto/uploaded-file.dto';
import { IPet, PetProfileNS } from 'src/interfaces/entities/pet.interface';

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
    @IsObject()
    @ValidateNested()
    @Type(() => PetBodyDto)
    body: PetBodyDto;

    @IsObject()
    @ValidateNested()
    @Type(() => PetCoatingDto)
    coat: PetCoatingDto;

    @IsObject()
    @ValidateNested()
    @Type(() => PetHeadDto)
    head: PetHeadDto;

    @IsString()
    legs: string;

    @IsString()
    size: string;
  }

  export class PetProfileDto implements PetProfileNS.IPetProfile {
    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetAppearanceDto))
    appearance: PetAppearanceDto;

    @IsString()
    breed: string;

    @IsString()
    description: string;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetExerciseDto))
    exercise: PetExerciseDto;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetGroomingDto))
    grooming: PetGroomingDto;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetHealthDto))
    health: PetHealthDto;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetTemperamentDto))
    temperament: PetTemperamentDto;

    @IsString()
    type: string;
  }
}

export class Pet implements IPet {
  @IsObject()
  @ValidateNested()
  @Type(() => PartialType(UploadedFileDto))
  avatar: UploadedFileDto;

  @IsString()
  bio: string;

  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PartialType(PetProfileDtoNS.PetProfileDto))
  profile: PetProfileDtoNS.PetProfileDto;

  @IsString()
  user_id: string;
}
