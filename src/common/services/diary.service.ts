import { Injectable } from '@nestjs/common';
import {
  DiaryEntity,
  DiarySortableField,
} from 'src/common/entities/diary.entity';
import { QueryOptions } from 'src/common/repositories/base/base.interface.repository';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';

import { DiaryRepository } from '../../common/repositories/diary.repository';
import { IListSortAndPaging } from '../dtos/common-request.dto';
import { IFIleUploadParams } from '../repositories/base/base.abstract.repository';
import { itemAndPageToLimitAndOffSet } from '../utils/converter';

@Injectable()
export class DiaryService extends BaseServiceAbstract<DiaryEntity> {
  constructor(private readonly diaryRepository: DiaryRepository) {
    super(diaryRepository);
  }

  async deleteImage(file_name: string) {
    return await this.diaryRepository.deleteFile(file_name);
  }

  async listDiary(
    { pet_id, user_id }: { pet_id?: string; user_id: string },
    options?: IListSortAndPaging<DiarySortableField>,
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

    return await this.diaryRepository.listDiary({
      options: {
        ...pagingSetting,
        ...sortingSetting,
      },
      values: {
        pet_id,
        user_id,
      },
    });
  }

  async uploadImage({
    contentType,
    customMetadata,
    file_name,
    fileAbsolutePath,
  }: IFIleUploadParams) {
    return await this.diaryRepository.uploadFile({
      contentType,
      customMetadata,
      file_name,
      fileAbsolutePath,
    });
  }
}
