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
  async collectAndPostOffer(query: string = 'promoção relâmpago') {
    try {
      this.logger.log('Fetching offers from Mercado Livre...');
      const offers = await this.mlService.searchOffers(query, 5);

      if (!offers || offers.length === 0) {
        this.logger.warn('No offers found.');
        return;
      }

      // Pega a primeira oferta para postar
      const topOffer = offers[0];
      
      // Detalhes completos (para pegar imagem melhor)
      const itemDetails = await this.mlService.getItemDetails(topOffer.id);

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

      this.logger.log('Offer successfully posted!');
    } catch (error) {
      this.logger.error('Error during collect and post routine:', error);
    }
  }
}
