import { Controller, Post, Query } from '@nestjs/common';
import { CollectorService } from './collector.service';

@Controller('collector')
export class CollectorController {
  constructor(private readonly collectorService: CollectorService) {}

  @Post('trigger')
  async triggerCollection(@Query('q') q?: string, @Query('url') url?: string) {
    // Roda em background
    this.collectorService.collectAndPostOffer(q, url).catch(err => {
      console.error('Error in background collection:', err);
    });
    
    return { success: true, message: 'Collection triggered in background.' };
  }
}
