import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';
import { IPet } from 'src/interfaces/entities/pet.interface';
import { UploadedFileDto } from '../dto/pet.dto';

export interface IPetRepository extends IBaseRepository<IPet> {
  listPetByUserId(
    user_id: string,
  ): ReturnType<IBaseRepository<IPet>['findAll']>;

  uploadPetAvatar({
    file_name,
    contentType,
    fileAbsolutePath,
    customMetadata,
  }: IAvatarUploadOptions): Promise<UploadedFileDto>;

  deleteFile(file_name: string): Promise<boolean>;
}

export interface IAvatarUploadOptions {
  file_name: string;
  contentType: string;
  fileAbsolutePath: string;
  customMetadata?: Record<string, any>;
}
