import { Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';
import { DiaryRepository } from './diary.repository';
import { IDiary } from 'src/interfaces/entities/pet-diary.interface';
import { IImageUploadParams } from './interfaces/diary.interface.repository';
import { QueryOptions } from 'src/common/repositories/base/base.interface.repository';

@Injectable()
export class DiaryService extends BaseServiceAbstract<IDiary> {
  constructor(private readonly diaryRepository: DiaryRepository) {
    super(diaryRepository);
  }

  async deleteImage(file_name: string) {
    return await this.diaryRepository.deleteFile(file_name);
  }

  async listDiary(
    { user_id, pet_id }: { user_id: string; pet_id?: string },
    queryOptions?: QueryOptions,
  ) {
    return await this.diaryRepository.listDiary({
      values: {
        user_id,
        pet_id,
      },
      options: queryOptions,
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
