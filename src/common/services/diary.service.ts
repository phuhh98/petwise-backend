import { Injectable } from '@nestjs/common';
import { DiaryEntity } from 'src/common/entities/diary.entity';
import { QueryOptions } from 'src/common/repositories/base/base.interface.repository';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';

import { DiaryRepository } from '../../common/repositories/diary.repository';
import { IFIleUploadParams } from '../repositories/base/base.abstract.repository';

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
    queryOptions?: QueryOptions,
  ) {
    return await this.diaryRepository.listDiary({
      options: queryOptions,
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
