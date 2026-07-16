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

  @Post('laboratory/analyze')
  async analyzeManualOffer(@Body() body: { url: string }) {
    if (!body.url) {
      return { success: false, message: 'URL is required' };
    }
    const analysis = await this.collectorService.analyzeManualOffer(body.url);
    return { success: true, analysis };
  }

  @Post('laboratory/publish')
  async publishManualOffer(@Body() body: { analysis: any }) {
    if (!body.analysis) {
      return { success: false, message: 'Analysis data is required' };
    }
    const result = await this.collectorService.publishManualOffer(body.analysis);
    return result;
  }
}
