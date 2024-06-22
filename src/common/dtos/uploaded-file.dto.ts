import { IsString, IsUrl } from 'class-validator';

export class UploadedFileDto {
  @IsString()
  file_id: string;

  @IsString()
  file_name: string;

  @IsUrl()
  public_url: string;
}
