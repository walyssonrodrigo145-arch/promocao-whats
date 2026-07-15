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

  async resolveUrlAndGetItemId(url: string): Promise<string | null> {
    try {
      let finalUrl = url;
      // Se for URL curta, segue o redirect
      if (url.includes('/sec/')) {
        const response = await fetch(url, { redirect: 'manual', headers: {'User-Agent': 'Mozilla/5.0'} });
        if (response.status >= 300 && response.status < 400) {
          finalUrl = response.headers.get('location') || url;
        } else if (response.status === 404) {
          // as vezes ML retorna 404 no manual redirect mas com a location no html ou headers
           finalUrl = response.headers.get('location') || url;
        }
      }
      
      const match = finalUrl.match(/MLB-?(\d+)/i);
      if (match) {
        return `MLB${match[1]}`;
      }
      return null;
    } catch (e) {
      this.logger.error('Failed to resolve URL', e);
      return null;
    }
  }

  async searchOffers(query: string = 'promoção', limit: number = 5): Promise<any[]> {
    try {
      this.logger.log(`Searching DuckDuckGo for ML offers with query: ${query}`);
      const ddgUrl = `https://html.duckduckgo.com/html/?q=site:produto.mercadolivre.com.br+${encodeURIComponent(query)}`;
      
      const response = await fetch(ddgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from DuckDuckGo');
      }

      const html = await response.text();
      const matches = html.match(/MLB-?\d+/g);
      
      if (!matches || matches.length === 0) {
        return [];
      }

      // Deduplicate and clean up IDs (ensure format MLB1234)
      const uniqueIds = [...new Set(matches.map(m => m.replace('-', '')))].slice(0, limit);
      
      const offers = uniqueIds.map(id => ({ id }));
      return offers;

    } catch (e) {
      this.logger.error('Error searching offers via DuckDuckGo', e);
      return [];
    }
  }

  async getItemDetails(itemId: string): Promise<any> {
    try {
      this.logger.log(`Fetching item details for ${itemId}`);
      // Token é removido pois a API pública de itens (de terceiros) rejeita com 403 o token de um App genérico.
      let response = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to fetch item ${itemId}: ${err}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      this.logger.error('Error fetching item details:', e);
      throw e;
    }
  }
}
