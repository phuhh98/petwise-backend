import { Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';
import { IPet } from 'src/types/pet.type';
import { FindAllResponse } from 'src/types/common.type';
import { PetRepository } from './pet.repository';
import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';

@Injectable()
export class PetService extends BaseServiceAbstract<IPet> {
  constructor(
    private readonly petRepository: PetRepository,
    // private readonly user_roles_service: UserRolesService,
  ) {
    super(petRepository);
  }

  async create(create_dto: IPet | any): Promise<IPet> {
    return await this.petRepository.create(create_dto);
  }

  /**
   * Throw Error on Not Found entity
   * @param id
   * @returns
   *
   */
  async findOne(id: string): Promise<IPet> {
    return await this.petRepository.findOneById(id);
  }

  async remove(id: string): Promise<boolean> {
    return await this.petRepository.permanentlyDelete(id);
  }

  async findAll(
    filter: Parameters<IBaseRepository<IPet>['findAll']>[0],
    options?: Parameters<IBaseRepository<IPet>['findAll']>[1],
  ): Promise<FindAllResponse<IPet>> {
    return await this.petRepository.findAll(filter, options);
  }

  async update(id: string, update_dto: Partial<IPet>): Promise<IPet> {
    return await this.petRepository.update(id, update_dto);
  }

  async listPet(user_id: string) {
    return this.petRepository.listPetByUserId(user_id);
  }
}
