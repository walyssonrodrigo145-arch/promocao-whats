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

  async refreshAccessToken(): Promise<string | null> {
    try {
      this.logger.log('Attempting to refresh access token...');
      const refreshConfig = await this.prisma.config.findUnique({
        where: { chave: 'ML_REFRESH_TOKEN' }
      });

      if (!refreshConfig || !refreshConfig.valor) {
        this.logger.warn('No refresh token found in database.');
        return null;
      }

      const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.appId!,
          client_secret: this.clientSecret!,
          refresh_token: refreshConfig.valor
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
      }

      await this.saveTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch (error) {
      this.logger.error('Failed to refresh token:', error);
      return null;
    }
  }

  async searchOffers(query: string = 'promoção', limit: number = 5): Promise<any[]> {
    try {
      this.logger.log(`Searching Mercado Livre for offers with query: ${query}`);
      const token = await this.getValidAccessToken();
      const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limit}&condition=new`;
      
      let response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        this.logger.warn('Token seems expired, refreshing...');
        token = await this.refreshAccessToken();
        if (token) {
          response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        }
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to search offers on ML: ${err}`);
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
      const token = await this.getValidAccessToken();
      let response = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        token = await this.refreshAccessToken();
        if (token) {
          response = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        }
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to fetch item ${itemId}: ${err}`);
      }

      return response.json();
    } catch (error) {
      this.logger.error('Error fetching item details:', error);
      throw error;
    }
  }
}
