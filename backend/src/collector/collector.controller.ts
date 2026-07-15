import { Controller, Post, Query, Body } from '@nestjs/common';
import { CollectorService } from './collector.service';

@Controller('collector')
export class CollectorController {
  constructor(private readonly collectorService: CollectorService) {}

  @Post('trigger')
  async triggerCollection(@Query('q') q?: string, @Query('url') url?: string) {
    this.collectorService.collectAndPostOffer(q, url).catch(err => {
      console.error('Error in background collection:', err);
    });
    
    return { success: true, message: 'Collection triggered in background.' };
  }

  @Post('receive-offer')
  async receiveOffer(@Body() offer: any) {
    // Roda em background
    this.collectorService.processDirectOffer(offer).catch(err => {
      console.error('Error in direct offer processing:', err);
    });
    
    return { success: true, message: 'Offer received and processing triggered.' };
  }
}
