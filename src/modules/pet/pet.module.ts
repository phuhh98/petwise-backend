import { Module, forwardRef } from '@nestjs/common';

import { PetRepository } from '../../common/repositories/pet.repository';
import { PetService } from '../../common/services/pet.service';
import { DiaryModule } from '../diary/diary.module';
import { PetController } from './pet.controller';

@Module({
  controllers: [PetController],
  exports: [PetService],
  imports: [forwardRef(() => DiaryModule)],
  providers: [PetService, PetRepository],
})
export class PetModule {}
