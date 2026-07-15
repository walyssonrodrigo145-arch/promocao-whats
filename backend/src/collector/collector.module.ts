import { Module } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { MercadoLivreModule } from '../mercadolivre/mercadolivre.module';
import { AiModule } from '../ai/ai.module';
import { EvolutionModule } from '../evolution/evolution.module';
import { CollectorController } from './collector.controller';

@Module({
  imports: [MercadoLivreModule, AiModule, EvolutionModule],
  providers: [CollectorService],
  controllers: [CollectorController]
})
export class CollectorModule {}
