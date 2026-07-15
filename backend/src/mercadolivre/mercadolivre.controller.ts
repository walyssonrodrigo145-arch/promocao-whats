import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { MercadoLivreService } from './mercadolivre.service';

@Controller('api')
export class MercadoLivreController {
  constructor(private readonly mlService: MercadoLivreService) {}

  @Get('mercadolivre/auth')
  login(@Res() res: Response) {
    const url = this.mlService.getAuthorizationUrl();
    return res.redirect(url);
  }

  @Get('auth/callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Código de autorização não fornecido pelo Mercado Livre.');
    }

    try {
      await this.mlService.exchangeCodeForToken(code);
      // Retorna uma tela de sucesso amigável
      return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="color: #4CAF50;">✅ Autorização Concluída!</h1>
              <p>O aplicativo foi vinculado com sucesso à sua conta do Mercado Livre.</p>
              <p>Os tokens foram salvos no banco de dados. Você já pode fechar esta aba.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      return res.status(500).send('Erro ao processar a autenticação. Verifique os logs do servidor.');
    }
  }
}
