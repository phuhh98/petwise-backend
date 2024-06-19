import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [PetController],
  imports: [ConfigModule],
  providers: [PetService],
})
export class PetModule {}
