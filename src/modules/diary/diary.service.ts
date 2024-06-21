import { Injectable } from '@nestjs/common';
import { QueryOptions } from 'src/common/repositories/base/base.interface.repository';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';
import { IDiary } from 'src/interfaces/entities/pet-diary.interface';

import { DiaryRepository } from './diary.repository';
import { IImageUploadParams } from './interfaces/diary.interface.repository';

@Injectable()
export class DiaryService extends BaseServiceAbstract<IDiary> {
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
  }: IImageUploadParams) {
    return await this.diaryRepository.uploadDiaryImage({
      contentType,
      customMetadata,
      file_name,
      fileAbsolutePath,
    });
  }
}
