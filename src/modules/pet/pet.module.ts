import { forwardRef, Module } from '@nestjs/common';

import { PetRepository } from '../../common/repositories/pet.repository';
import { PetService } from '../../common/services/pet.service';
import { PetController } from './pet.controller';
import { DiaryModule } from '../diary/diary.module';
import { DiaryRepository } from 'src/common/repositories/diary.repository';

@Module({
  imports: [forwardRef(() => DiaryModule)],
  controllers: [PetController],
  exports: [PetService],
  providers: [PetService, PetRepository, DiaryRepository],
})
export class PetModule {}
