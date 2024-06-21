import { Module } from '@nestjs/common';

import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { DiaryRepository } from './diary.repository';
import { PetModule } from '../pet/pet.module';

@Module({
  controllers: [DiaryController],
  imports: [PetModule],
  exports: [DiaryService],
  providers: [DiaryService, DiaryRepository],
})
export class DiaryModule {}
