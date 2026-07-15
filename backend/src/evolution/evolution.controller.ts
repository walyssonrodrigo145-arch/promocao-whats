import { Controller, Get, Query, Res, HttpException, HttpStatus, Post, Body } from '@nestjs/common';
import { EvolutionService } from './evolution.service';
import type { Response } from 'express';

@Controller('api/evolution')
export class EvolutionController {
  constructor(private readonly evolutionService: EvolutionService) {}

  @Get('qrcode')
  async getQrCode(@Query('instance') instanceName: string, @Res() res: Response) {
    try {
      const data = await this.evolutionService.getQrCode(instanceName);
      
      // Se já estiver conectado, a API da Evolution geralmente não retorna o QR Code em base64 e o estado fica 'open'
      if (data?.instance?.state === 'open' || data?.state === 'open') {
        return res.send(`
          <html>
            <body style="font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
              <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #4CAF50;">✅ WhatsApp Conectado!</h1>
                <p>A instância já está conectada e pronta para enviar mensagens.</p>
              </div>
            </body>
          </html>
        `);
      }

      const base64Qr = data.base64 || data?.qrcode?.base64;

      if (!base64Qr) {
        return res.send(`
          <html>
            <body style="font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
              <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #FF9800;">Aguardando...</h1>
                <p>Não foi possível obter o QR Code. A instância pode estar em outro estado ou conectando.</p>
                <p><pre>${JSON.stringify(data, null, 2)}</pre></p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; margin-top: 20px;">Recarregar</button>
              </div>
            </body>
          </html>
        `);
      }

      // Mostra o QR Code na tela
      return res.send(`
        <html>
          <body style="font-family: Arial; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2>Escaneie o QR Code no seu WhatsApp</h2>
              <p>Instância: <strong>${instanceName || 'Padrão'}</strong></p>
              <img src="${base64Qr}" alt="QR Code" style="width: 300px; height: 300px; border: 1px solid #ccc; border-radius: 8px; margin: 20px 0;" />
              <br/>
              <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #008CBA; color: white; border: none; border-radius: 5px;">Atualizar QR Code</button>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      return res.status(500).send(`Erro ao buscar QR Code: ${error.message}`);
    }
  }

  @Get('groups')
  async getGroups(@Query('instance') instanceName: string) {
    try {
      const groups = await this.evolutionService.getGroups(instanceName);
      return groups;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    try {
      if (body.event === 'messages.upsert' && body.data) {
        const messages = body.data.messages || [];
        if (messages.length === 0) return { success: true };

        const msg = messages[0];
        
        if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return { success: true };

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        
        if (text.includes('mercadolivre.com') || text.includes('mlb.com')) {
          console.log('Detected Mercado Livre Link via Webhook!');
          
          // Dispara o nosso Collector, que vai processar e jogar no grupo!
          fetch('http://localhost:3000/collector/trigger?url=' + encodeURIComponent(text), { method: 'POST' }).catch(e => console.error(e));
        }
      }
    } catch(e) {
      console.error('Webhook error:', e);
    }
    
    return { success: true };
  }
}
