import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';
import { IPet } from 'src/types/pet.type';

export interface IPetRepository extends IBaseRepository<IPet> {
  listPetByUserId(
    user_id: string,
  ): ReturnType<IBaseRepository<IPet>['findAll']>;
}
