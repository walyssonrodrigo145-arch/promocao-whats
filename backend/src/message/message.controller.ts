import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('api/message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('test')
  async sendTest(@Body() body: { jid: string; instanceName?: string }) {
    if (!body.jid) {
      throw new HttpException('JID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const result = await this.messageService.sendTestMessage(body.jid, body.instanceName);
      return { success: true, result };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
