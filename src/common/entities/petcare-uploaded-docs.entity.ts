import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { BaseEntity } from './base.entity';

/**
 * This entity is aimed to track the uniqueness of uploaded document
 * in order to avoid unecessary upload of duplicate document
 */
export class PetCareUploadedDocsEntity extends BaseEntity {
  @ValidateNested()
  @Type(() => UploadedDocumentMetaData)
  metadata: UploadedDocumentMetaData;

  @IsString()
  sha256_hash: string;
}

export class UploadedDocumentMetaData {
  @IsString()
  original_file_name: string;

  @IsString()
  subject: string;
}
