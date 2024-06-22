import { Module } from '@nestjs/common';
import { DiaryService } from 'src/common/services/diary.service';

import { DiaryRepository } from '../../common/repositories/diary.repository';
import { PetModule } from '../pet/pet.module';
import { DiaryController } from './diary.controller';

@Module({
  controllers: [DiaryController],
  exports: [DiaryService],
  imports: [PetModule],
  providers: [DiaryService, DiaryRepository],
})
export class DiaryModule {}
