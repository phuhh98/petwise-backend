import { UploadedFileDto } from 'src/common/dto/uploaded-file.dto';
import {
  IBaseRepository,
  QueryOptions,
} from 'src/common/repositories/base/base.interface.repository';
import { IDiary } from 'src/interfaces/entities/pet-diary.interface';

export interface IDiaryRepository extends IBaseRepository<IDiary> {
  deleteFile(file_name: string): Promise<boolean>;

  listDiary(
    searchParams: IListDiaryParams,
  ): Promise<ReturnType<IBaseRepository<IDiary>['findAll']>>;

  uploadDiaryImage(uploadParams: IImageUploadParams): Promise<UploadedFileDto>;
}

export interface IImageUploadParams {
  contentType: string;
  customMetadata?: Record<string, any>;
  file_name: string;
  fileAbsolutePath: string;
}

export interface IListDiaryParams {
  options?: QueryOptions;
  values: {
    pet_id?: string;
    user_id: string;
  };
}
