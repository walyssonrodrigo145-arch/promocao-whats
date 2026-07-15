import { Injectable, Logger } from '@nestjs/common';
import { EvolutionService } from '../evolution/evolution.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly evolutionService: EvolutionService) {}

  async sendTestMessage(jid: string, instanceName?: string) {
    try {
      this.logger.log(`Sending test message to ${jid}`);
      const text = 'Olá! 👋 Esta é uma mensagem de teste enviada pelo seu novo robô MusicPro!';
      
      const response = await this.evolutionService.sendTextMessage(jid, text, instanceName);
      return response;
    } catch (error) {
      this.logger.error('Failed to send test message:', error);
      throw error;
    }
  }
}
