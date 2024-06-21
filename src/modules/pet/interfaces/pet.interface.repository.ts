import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';
import { IPet } from 'src/interfaces/entities/pet.interface';

import { UploadedFileDto } from '../dto/pet.dto';

export interface IPetRepository extends IBaseRepository<IPet> {
  deleteFile(file_name: string): Promise<boolean>;

  listPetByUserId(
    user_id: string,
  ): ReturnType<IBaseRepository<IPet>['findAll']>;

  uploadPetAvatar({
    contentType,
    customMetadata,
    file_name,
    fileAbsolutePath,
  }: IAvatarUploadOptions): Promise<UploadedFileDto>;
}

export interface IAvatarUploadOptions {
  contentType: string;
  customMetadata?: Record<string, any>;
  file_name: string;
  fileAbsolutePath: string;
}