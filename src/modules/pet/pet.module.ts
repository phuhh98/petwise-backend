import { Module } from '@nestjs/common';

import { PetRepository } from '../../common/repositories/pet.repository';
import { PetService } from '../../common/services/pet.service';
import { PetController } from './pet.controller';

@Module({
  controllers: [PetController],
  exports: [PetService],
  providers: [PetService, PetRepository],
})
export class PetModule {}
