import { Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';
import { IPet } from 'src/interfaces/entities/pet.interface';

import { IAvatarUploadOptions } from './interfaces/pet.interface.repository';
import { PetRepository } from './pet.repository';

@Injectable()
export class PetService extends BaseServiceAbstract<IPet> {
  constructor(private readonly petRepository: PetRepository) {
    super(petRepository);
  }

  async deleteAvatarImage(file_name: string) {
    return await this.petRepository.deleteFile(file_name);
  }

  async listPet(user_id: string) {
    return this.petRepository.listPetByUserId(user_id);
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
