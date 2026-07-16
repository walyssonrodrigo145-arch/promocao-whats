import { Module } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { MercadoLivreModule } from '../mercadolivre/mercadolivre.module';
import { AiModule } from '../ai/ai.module';
import { EvolutionModule } from '../evolution/evolution.module';
import { CollectorController } from './collector.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MercadoLivreModule, AiModule, EvolutionModule, PrismaModule],
  providers: [CollectorService],
  controllers: [CollectorController]
})
export class CollectorModule {}
