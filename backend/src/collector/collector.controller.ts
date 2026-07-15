import { Controller, Post, Query } from '@nestjs/common';
import { CollectorService } from './collector.service';

@Controller('collector')
export class CollectorController {
  constructor(private readonly collectorService: CollectorService) {}

  @Post('trigger')
  async triggerCollection(@Query('q') query: string) {
    // Roda em background
    this.collectorService.collectAndPostOffer(query || 'promoção relâmpago').catch(console.error);
    return { success: true, message: 'Collection triggered in background.' };
  }
}
