import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import { PetRepositoryInterface } from './interfaces/pet.interface.repository';
import { Pet, PetId } from 'src/types/pet.type';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';
import { BaseRepositoryInterface } from 'src/common/repositories/base/base.interface.repository';

@Injectable()
export class PetRepository
  extends BaseRepositoryAbstract<Pet & PetId>
  implements PetRepositoryInterface
{
  constructor(private readonly fireStoreService: FirestoreService) {
    super(fireStoreService.fireStore, 'pet');
  }

  async listPetByUserId(
    user_id: string,
  ): ReturnType<BaseRepositoryInterface<Pet & PetId>['findAll']> {
    return await super.findAll([
      { fieldPath: 'user_id', opStr: '==', value: user_id },
    ]);
  }
}
