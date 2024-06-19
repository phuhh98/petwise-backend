import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreatePetDto, UpdatePetDto } from './pet.dto';
import { PetService } from './pet.service';
import { FirebaseAuthenticationGuard } from 'src/firebase-authentication/firebase-authentication.guard';
import { ResLocals } from 'src/types/express.types';
import { ControllerReturn } from 'src/types/nest-controller-return-format.types';
import { Pet, PetId } from 'src/types/pet.type';
import { ProviderTokens } from 'src/constants/provider-token.constant';
import { ErrorValidatorService } from 'src/error-validator/error-validator.service';

@Controller('pet')
@UseGuards(FirebaseAuthenticationGuard)
export class PetController {
  @Inject(ProviderTokens['ERROR_VALIDATOR'])
  private readonly errorValidator: ErrorValidatorService;

  constructor(private readonly petService: PetService) {}

  @Get('list')
  async listPet(
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
  ): Promise<ControllerReturn.CrudCompletedMessage<(Pet & PetId)[]>> {
    const user_id = response.locals.user_id;

    const pets = await this.petService.listPets(user_id);

    return {
      message: 'List pets succeed',
      pets,
    };
  }

  @Post()
  async createPet(
    @Body()
    createPetDto: CreatePetDto,
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
  ): Promise<ControllerReturn.CrudCompletedMessage<Pet & PetId>> {
    const user_id = response.locals.user_id;
    createPetDto.user_id = user_id;

    const createdPetData = await this.petService.createPet(createPetDto);

    if (this.errorValidator.isError(createdPetData)) {
      throw new InternalServerErrorException(createdPetData.message);
    }

    return {
      message: 'Create pet succeed',
      pet: createdPetData,
    };
  }

  @Get(':pet_id')
  async getPet(
    @Param('pet_id') pet_id: string,
  ): Promise<ControllerReturn.CrudCompletedMessage<Pet & PetId>> {
    const petData = await this.petService.getPet(pet_id);

    if (this.errorValidator.isError(petData)) {
      throw new NotFoundException(petData.message);
    }

    return {
      message: 'Get pet succeed',
      pet: petData,
    };
  }

  @Patch(':pet_id')
  async updatePet(
    @Param('pet_id') pet_id: string,
    @Body()
    updatePetDto: UpdatePetDto,
  ) {
    const updatedData = await this.petService.updatePet(pet_id, updatePetDto);

    if (this.errorValidator.isError(updatedData)) {
      throw new InternalServerErrorException(updatedData.message);
    }

    return {
      message: 'Update pet succeed',
      pet: updatedData,
    };
  }

  @Delete(':pet_id')
  async deletePet(@Param('pet_id') pet_id: string) {
    await this.petService.deletePet(pet_id);

    return {
      message: `Delete pet_id ${pet_id} succeed`,
    };
  }
}
