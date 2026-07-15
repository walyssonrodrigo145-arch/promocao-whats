import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { EvolutionModule } from '../evolution/evolution.module';

@Module({
  imports: [EvolutionModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
