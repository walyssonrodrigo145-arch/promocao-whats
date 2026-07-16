import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiLearningService } from './ai-learning.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AiService, AiLearningService],
  exports: [AiService, AiLearningService]
})
export class AiModule {}
