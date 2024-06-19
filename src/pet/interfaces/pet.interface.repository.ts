import { BaseRepositoryInterface } from 'src/common/repositories/base/base.interface.repository';
import { Pet, PetId } from 'src/types/pet.type';

export interface PetRepositoryInterface
  extends BaseRepositoryInterface<Pet & PetId> {
  listPetByUserId(
    user_id: string,
  ): ReturnType<BaseRepositoryInterface<Pet & PetId>['findAll']>;
}
