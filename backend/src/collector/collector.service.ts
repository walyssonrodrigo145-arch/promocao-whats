import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MercadoLivreService } from '../mercadolivre/mercadolivre.service';
import { AiService } from '../ai/ai.service';
import { EvolutionService } from '../evolution/evolution.service';

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);
  
  // O JID do grupo onde as ofertas serão postadas
  // Ex: 120363427056717824@g.us para WRPROMO
  private readonly TARGET_GROUP_JID = '120363427056717824@g.us';

  constructor(
    private readonly mlService: MercadoLivreService,
    private readonly aiService: AiService,
    private readonly evolutionService: EvolutionService
  ) {}

  // A cada 4 horas
  @Cron('0 */4 * * *')
  async handleCron() {
    this.logger.log('Starting scheduled offer collection...');
    await this.collectAndPostOffer();
  }

  // Método que orquestra: ML -> AI -> WhatsApp
  async collectAndPostOffer(query: string = 'promoção', url?: string) {
    try {
      let item = null;

      if (url) {
        this.logger.log(`Processing URL directly: ${url}`);
        const itemId = await this.mlService.resolveUrlAndGetItemId(url);
        if (itemId) {
          this.logger.log(`Resolved Item ID: ${itemId}`);
          item = await this.mlService.getItemDetails(itemId);
        } else {
          this.logger.warn(`Could not resolve Item ID from URL: ${url}`);
          return;
        }
      } else {
        this.logger.log('Fetching offers from Mercado Livre via search...');
        const offers = await this.mlService.searchOffers(query, 1);
        
        if (!offers || offers.length === 0) {
          this.logger.warn('No offers found for query:', query);
          return;
        }

        const offer = offers[0];
        item = await this.mlService.getItemDetails(offer.id);
      }

      if (!item) {
        this.logger.warn('Could not fetch item details.');
        return;
      }
      
      // Detalhes completos (para pegar imagem melhor)
      const itemDetails = item;

      // Obter imagem principal (a primeira foto)
      const imageUrl = itemDetails.pictures && itemDetails.pictures.length > 0 
        ? itemDetails.pictures[0].url 
        : itemDetails.thumbnail;

      const productInfo = {
        title: itemDetails.title,
        price: itemDetails.price,
        permalink: itemDetails.permalink,
      };

      this.logger.log('Generating AI copy...');
      const copy = await this.aiService.generateCopy(productInfo);

      this.logger.log(`Sending message to WhatsApp group ${this.TARGET_GROUP_JID}...`);
      if (imageUrl) {
        // Envia imagem com legenda
        await this.evolutionService.sendMediaMessage(this.TARGET_GROUP_JID, copy, imageUrl);
      } else {
        // Fallback: só texto
        await this.evolutionService.sendTextMessage(this.TARGET_GROUP_JID, copy);
      }

      this.logger.log('Collect and post routine completed.');
    } catch (error) {
      this.logger.error('Error during collect and post routine:');
      this.logger.error(error);
    }
  }

  async processDirectOffer(offer: { id: string, title: string, price: number, permalink: string, pictureUrl: string }) {
    try {
      this.logger.log(`Processing direct offer received from scraper: ${offer.title}`);
      
      const link = offer.permalink;
      const title = offer.title;
      const price = offer.price;
      const pictures = [{ url: offer.pictureUrl }];

      const message = await this.aiService.generateCopy({ title, price, permalink: link });

      this.logger.log(`Copy generated. Posting to WhatsApp...`);

      // 5. Send Message to Evolution API
      if (pictures && pictures.length > 0 && pictures[0].url) {
        // A Evolution API aceita URL diretamente em mediaUrl
        await this.evolutionService.sendMediaMessage(this.TARGET_GROUP_JID, message, pictures[0].url);
      } else {
        await this.evolutionService.sendTextMessage(this.TARGET_GROUP_JID, message);
      }

      this.logger.log('Direct offer successfully processed and posted.');
    } catch (e) {
      this.logger.error('Error during processDirectOffer:', e);
    }
  }
}
