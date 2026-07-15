import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MercadoLivreService {
  private readonly logger = new Logger(MercadoLivreService.name);
  
  private readonly appId = process.env.ML_APP_ID;
  private readonly clientSecret = process.env.ML_CLIENT_SECRET;
  private readonly redirectUri = process.env.ML_REDIRECT_URI;

  constructor(private readonly prisma: PrismaService) {}

  getAuthorizationUrl(): string {
    return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${this.appId}&redirect_uri=${this.redirectUri}`;
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      this.logger.log('Exchanging code for token...');
      
      const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.appId!,
          client_secret: this.clientSecret!,
          code: code,
          redirect_uri: this.redirectUri!
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error('Error from ML API:', data);
        throw new Error(data.message || 'Failed to exchange token');
      }

      // Save tokens to DB
      await this.saveTokens(data.access_token, data.refresh_token);

      return data;
    } catch (error) {
      this.logger.error('Failed to exchange code for token', error);
      throw error;
    }
  }

  private async saveTokens(accessToken: string, refreshToken: string) {
    // Upsert Access Token
    await this.prisma.config.upsert({
      where: { chave: 'ML_ACCESS_TOKEN' },
      update: { valor: accessToken },
      create: { chave: 'ML_ACCESS_TOKEN', valor: accessToken }
    });

    // Upsert Refresh Token
    if (refreshToken) {
      await this.prisma.config.upsert({
        where: { chave: 'ML_REFRESH_TOKEN' },
        update: { valor: refreshToken },
        create: { chave: 'ML_REFRESH_TOKEN', valor: refreshToken }
      });
    }

    this.logger.log('Mercado Livre tokens saved to database.');
  }

  async getValidAccessToken(): Promise<string | null> {
    const config = await this.prisma.config.findUnique({
      where: { chave: 'ML_ACCESS_TOKEN' }
    });
    
    return config ? config.valor : null;
  }

  async searchOffers(query: string = 'promoção', limit: number = 5): Promise<any[]> {
    try {
      this.logger.log(`Searching Mercado Livre for offers with query: ${query}`);
      // Busca produtos pelo termo. Idealmente buscaríamos deals (ofertas do dia),
      // mas a API aberta de search com termo funciona muito bem.
      const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limit}&condition=new`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search offers on ML');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      this.logger.error('Error searching offers:', error);
      throw error;
    }
  }

  async getItemDetails(itemId: string): Promise<any> {
    try {
      this.logger.log(`Fetching item details for ${itemId}`);
      const response = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch item ${itemId}`);
      }

      return response.json();
    } catch (error) {
      this.logger.error('Error fetching item details:', error);
      throw error;
    }
  }
}
