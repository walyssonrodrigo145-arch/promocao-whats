import { Module } from '@nestjs/common';
import { EvolutionService } from './evolution.service';

@Module({
  providers: [EvolutionService]
})
export class EvolutionModule {}
