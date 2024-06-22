import { IsString, IsUrl } from 'class-validator';

export class UploadedFileEntity {
  @IsString()
  file_id: string;

  @IsString()
  file_name: string;

  @IsUrl()
  public_url: string;
}
