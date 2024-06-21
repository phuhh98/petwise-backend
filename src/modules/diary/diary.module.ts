import { Module } from '@nestjs/common';

import { PetModule } from '../pet/pet.module';
import { DiaryController } from './diary.controller';
import { DiaryRepository } from './diary.repository';
import { DiaryService } from './diary.service';

@Module({
  controllers: [DiaryController],
  exports: [DiaryService],
  imports: [PetModule],
  providers: [DiaryService, DiaryRepository],
})
export class DiaryModule {}
