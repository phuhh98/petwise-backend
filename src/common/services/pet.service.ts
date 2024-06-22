import { Injectable } from '@nestjs/common';
import { PetEntity } from 'src/common/entities/pet.entity';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';

import { IFIleUploadParams } from '../repositories/base/base.abstract.repository';
import { PetRepository } from '../repositories/pet.repository';
import { DiaryRepository } from '../repositories/diary.repository';

@Injectable()
export class PetService extends BaseServiceAbstract<PetEntity> {
  constructor(
    private readonly petRepository: PetRepository,
    private readonly diaryRepository: DiaryRepository,
  ) {
    super(petRepository);
  }

  async remove(id: string, user_id: string): Promise<boolean> {
    await super.remove(id);

    const diaries = await this.diaryRepository.listDiary({
      values: {
        pet_id: id,
        user_id: user_id,
      },
    });

    const res = await Promise.all(
      diaries.items.map(async (diary) => {
        return {
          deleted: await this.diaryRepository.delete(diary.id),
          diary_id: diary.id,
        };
      }),
    );
    if (!res.every((result) => result.deleted))
      throw new Error(`Error while clean up diaries for Pet with id ${id}`);

    return true;
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
  }: IFIleUploadParams) {
    return await this.petRepository.uploadFile({
      contentType,
      customMetadata,
      file_name,
      fileAbsolutePath,
    });
  }
}
