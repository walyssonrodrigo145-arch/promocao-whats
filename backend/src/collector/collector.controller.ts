import { Controller, Post, Query, Body, Get } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { AiLearningService } from '../ai/ai-learning.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('collector')
export class CollectorController {
  constructor(
    private readonly collectorService: CollectorService,
    private readonly aiLearningService: AiLearningService,
    private readonly prisma: PrismaService
  ) {}

  @Get('learning')
  async getDailyLearningReport() {
    const report = await this.aiLearningService.getLatestReport();
    return { report };
  }

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

  @Post('laboratory/analyze-request')
  async requestAnalysis(@Body() body: { url: string }) {
    if (!body.url) return { success: false, message: 'URL is required' };
    const taskId = await this.collectorService.requestAnalysisTask(body.url);
    return { success: true, taskId };
  }

  @Get('laboratory/analyze-status')
  async getAnalysisStatus(@Query('taskId') taskId: string) {
    if (!taskId) return { success: false, message: 'taskId is required' };
    const status = this.collectorService.getTaskStatus(taskId);
    return { success: true, data: status };
  }

  @Get('laboratory/pending-tasks')
  async getPendingTasks() {
    const task = this.collectorService.getPendingTask();
    return { success: true, task };
  }

  @Post('laboratory/submit-task')
  async submitTaskResult(@Body() body: { taskId: string, scrapedData: any }) {
    if (!body.taskId || !body.scrapedData) return { success: false, message: 'Missing parameters' };
    
    // Roda a submissão (que chama a IA) em background para não travar o bot
    this.collectorService.submitTaskData(body.taskId, body.scrapedData).catch(err => {
      console.error('Error in submitTaskData:', err);
    });
    
    return { success: true, message: 'Task submitted successfully. AI analysis started.' };
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
