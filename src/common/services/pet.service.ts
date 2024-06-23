import { Injectable } from '@nestjs/common';
import { PetEntity, PetSortableField } from 'src/common/entities/pet.entity';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';

import { IListSortAndPaging } from '../dtos/common-request.dto';
import { IFIleUploadParams } from '../repositories/base/base.abstract.repository';
import { QueryOptions } from '../repositories/base/base.interface.repository';
import { DiaryRepository } from '../repositories/diary.repository';
import { PetRepository } from '../repositories/pet.repository';
import { itemAndPageToLimitAndOffSet } from '../utils/converter';

@Injectable()
export class PetService extends BaseServiceAbstract<PetEntity> {
  constructor(
    private readonly petRepository: PetRepository,
    private readonly diaryRepository: DiaryRepository,
  ) {
    super(petRepository);
  }

  async deleteAvatarImage(file_name: string) {
    return await this.petRepository.deleteFile(file_name);
  }

  async listPet(
    user_id: string,
    options: IListSortAndPaging<PetSortableField>,
  ) {
    const pagingSetting: Omit<QueryOptions, 'orderBy'> =
      options.max_items || options.page
        ? itemAndPageToLimitAndOffSet(options.max_items, options.page)
        : {};

    const sortingSetting: Pick<QueryOptions, 'orderBy'> = options.sort
      .sortKey && {
      orderBy: {
        directionStr: options.sort.order,
        fieldPath: options.sort.sortKey,
      },
    };

    return this.petRepository.listPetByUserId(user_id, {
      ...pagingSetting,
      ...sortingSetting,
    });
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
