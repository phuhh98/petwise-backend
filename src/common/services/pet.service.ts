import { Injectable } from '@nestjs/common';
import { PetEntity } from 'src/common/entities/pet.entity';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';

import {
  IAvatarUploadOptions,
  PetRepository,
} from '../repositories/pet.repository';

@Injectable()
export class PetService extends BaseServiceAbstract<PetEntity> {
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
