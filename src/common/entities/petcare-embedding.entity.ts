import { IsNumber, IsString } from 'class-validator';

import { BaseEntity } from './base.entity';

export class PetCareEmbeddingEntity extends BaseEntity {
  @IsString()
  chunk: string;

  @IsNumber({}, { each: true })
  embedding: (FirebaseFirestore.VectorValue | number)[];
}
