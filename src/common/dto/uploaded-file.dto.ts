import { IsString, IsUrl } from 'class-validator';
import { IUploadedFile } from 'src/interfaces/entities/pet.interface';

export class UploadedFileDto implements IUploadedFile {
  @IsString()
  file_id: string;

  @IsString()
  file_name: string;

  @IsUrl()
  public_url: string;
}
