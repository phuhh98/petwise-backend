import { Injectable } from '@nestjs/common';
import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';
import { IPet } from 'src/interfaces/entities/pet.interface';
import { IFindManyReturnFormat } from 'src/interfaces/services/find-many-return.interface';

import { IAvatarUploadOptions } from './interfaces/pet.interface.repository';
import { PetRepository } from './pet.repository';

@Injectable()
export class PetService extends BaseServiceAbstract<IPet> {
  constructor(private readonly petRepository: PetRepository) {
    super(petRepository);
  }

  async create(create_dto: IPet | any): Promise<IPet> {
    return await this.petRepository.create(create_dto);
  }

  async deleteAvatarImage(file_name: string) {
    return await this.petRepository.deleteFile(file_name);
  }

  async findAll(
    filter: Parameters<IBaseRepository<IPet>['findAll']>[0],
    options?: Parameters<IBaseRepository<IPet>['findAll']>[1],
  ): Promise<IFindManyReturnFormat<IPet>> {
    return await this.petRepository.findAll(filter, options);
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

  async listPet(user_id: string) {
    return this.petRepository.listPetByUserId(user_id);
  }

  async remove(id: string): Promise<boolean> {
    return await this.petRepository.permanentlyDelete(id);
  }

  async update(id: string, update_dto: Partial<IPet>): Promise<IPet> {
    return await this.petRepository.update(id, update_dto);
  }

  async uploadAvatarImage({
    contentType,
    customMetadata,
    file_name,
    fileAbsolutePath,
  }: IAvatarUploadOptions) {
    return await this.petRepository.uploadPetAvatar({
      contentType,
      customMetadata,
      file_name,
      fileAbsolutePath,
    });
  }
}
