import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import { IPetRepository } from './interfaces/pet.interface.repository';
import { IPet } from 'src/types/pet.type';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';
import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';

@Injectable()
export class PetRepository
  extends BaseRepositoryAbstract<IPet>
  implements IPetRepository
{
  constructor(private readonly fireStoreService: FirestoreService) {
    super(fireStoreService.fireStore, 'pet');
  }

  async listPetByUserId(
    user_id: string,
  ): ReturnType<IBaseRepository<IPet>['findAll']> {
    return await super.findAll([
      { fieldPath: 'user_id', opStr: '==', value: user_id },
    ]);
  }
}
