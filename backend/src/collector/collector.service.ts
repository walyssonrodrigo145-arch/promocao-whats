import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MercadoLivreService } from '../mercadolivre/mercadolivre.service';
import { AiService } from '../ai/ai.service';
import { EvolutionService } from '../evolution/evolution.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);
  
  // O JID do grupo onde as ofertas serão postadas
  // Ex: 120363427056717824@g.us para WRPROMO
  private readonly TARGET_GROUP_JID = '120363427056717824@g.us';

  constructor(
    private readonly mlService: MercadoLivreService,
    private readonly aiService: AiService,
    private readonly evolutionService: EvolutionService,
    private readonly prisma: PrismaService
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
        image: imageUrl
      };

      this.logger.log('Step 1: Running AI Analyst (Pipeline Stage 1)...');
      let analysisJson: any = null;
      try {
        analysisJson = await this.aiService.analyzeProduct(productInfo);
        this.logger.log(`Analysis complete. Score: ${analysisJson.score}`);
      } catch (err) {
        this.logger.warn('Failed AI Analysis, falling back to raw data for Copywriter.');
        analysisJson = productInfo;
      }

      this.logger.log('Step 2: Generating AI Copy (Pipeline Stage 2)...');
      const copy = await this.aiService.generateCopy(analysisJson);

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

  async processDirectOffer(offer: any) {
    try {
      this.logger.log(`Processing direct offer received from scraper: ${offer.title}`);
      
      let link = offer.permalink || offer.affiliateLink;
      let title = offer.title;
      let price = offer.price;
      let imageUrl = offer.pictureUrl;

      // Fallback Inteligente: Se o robô não conseguiu extrair o título ou a foto do Dashboard de Afiliados,
      // o Backend usa o link curto gerado para descobrir o ID do produto e consultar a API oficial do ML!
      if (title === 'Oferta Imperdível' || !imageUrl) {
         this.logger.log(`Incomplete data received. Resolving shortlink ${link} to fetch real data from ML API...`);
         const itemId = await this.mlService.resolveUrlAndGetItemId(link);
         if (itemId) {
             const itemDetails = await this.mlService.getItemDetails(itemId);
             if (itemDetails) {
                 title = itemDetails.title || title;
                 price = itemDetails.price || price;
                 imageUrl = (itemDetails.pictures && itemDetails.pictures.length > 0) 
                            ? itemDetails.pictures[0].url 
                            : (itemDetails.thumbnail || imageUrl);
                 this.logger.log(`Fallback successful! Real title: ${title}`);
             }
         }
      }

      const productInfo = { title, price, permalink: link, image: imageUrl };
      
      let analysisJson: any = offer.aiEvaluation;

      if (!analysisJson) {
        this.logger.log('Step 1: Running AI Analyst (Pipeline Stage 1)...');
        try {
          analysisJson = await this.aiService.analyzeProduct(productInfo);
          this.logger.log(`Analysis complete. Score: ${analysisJson.score}, Priority: ${analysisJson.prioridade}`);
        } catch (err) {
          this.logger.warn('Failed AI Analysis, falling back to raw data for Copywriter.');
          analysisJson = productInfo;
        }
      } else {
        this.logger.log('Step 1: Skipping AI Analyst (Received pre-computed analysis from Scraper payload).');
        analysisJson._raw = productInfo;
      }

      this.logger.log('Step 2: Generating AI Copy (Pipeline Stage 2)...');
      let message = await this.aiService.generateCopy(analysisJson);
      
      // Inject actual affiliate link replacing placeholder, or append if missing
      if (message.includes('{{LINK_AFILIADO}}')) {
        message = message.replace('{{LINK_AFILIADO}}', link);
      } else {
        message = message + '\n\n👉 Confira aqui: ' + link;
      }

      this.logger.log(`Copy generated. Posting to WhatsApp...`);

      // 5. Send Message to Evolution API
      if (imageUrl) {
        // A Evolution API aceita URL diretamente em mediaUrl
        await this.evolutionService.sendMediaMessage(this.TARGET_GROUP_JID, message, imageUrl);
      } else {
        await this.evolutionService.sendTextMessage(this.TARGET_GROUP_JID, message);
      }

      // 6. Salvar no Banco de Dados (Para a Lojinha Virtual com dados ricos)
      try {
        const dbProduct = await this.prisma.produto.create({
          data: {
            titulo: title,
            precoAtual: price,
            imagem: imageUrl || '',
            linkOriginal: link, // Usando o link reduzido
            dataPromocao: new Date(),
            nicho: analysisJson?.nicho || null,
            publicoAlvo: analysisJson?.publico_alvo || null,
            intencaoCompra: analysisJson?.intencao_compra || null,
            score: analysisJson?.score ? parseInt(analysisJson.score) : null,
            prioridade: analysisJson?.prioridade || null,
            gatilhos: analysisJson?.gatilhos || [],
            beneficios: analysisJson?.beneficios || [],
            doresResolvidas: analysisJson?.dores_resolvidas || [],
            palavrasImpacto: analysisJson?.palavras_impacto || [],
            linksAfiliado: {
              create: {
                linkOriginal: link,
                linkGerado: link,
                plataforma: 'MERCADOLIVRE'
              }
            }
          }
        });
        this.logger.log(`Product saved to database with ID: ${dbProduct.id} and rich AI fields.`);
      } catch (dbError) {
        this.logger.error(`Failed to save product to DB: ${dbError.message}`);
      }

      this.logger.log('Direct offer successfully processed and posted.');
    } catch (e) {
      this.logger.error('Error during processDirectOffer:', e);
    }
  }

  private laboratoryTasks = new Map<string, any>();

  // Cria a tarefa e devolve o ID
  async requestAnalysisTask(url: string) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.laboratoryTasks.set(taskId, {
      id: taskId,
      url,
      status: 'PENDING',
      scrapedData: null,
      analysisResult: null,
      error: null,
      createdAt: Date.now()
    });
    this.logger.log(`[Laboratory] Task ${taskId} created for URL: ${url}`);
    return taskId;
  }

  // Verifica o status da tarefa
  getTaskStatus(taskId: string) {
    const task = this.laboratoryTasks.get(taskId);
    if (!task) return { status: 'NOT_FOUND' };
    return task;
  }

  // Pega a próxima tarefa pendente (Usado pelo Robô Garimpeiro)
  getPendingTask() {
    for (const [taskId, task] of this.laboratoryTasks.entries()) {
      if (task.status === 'PENDING') {
        task.status = 'PROCESSING';
        this.laboratoryTasks.set(taskId, task);
        this.logger.log(`[Laboratory] Task ${taskId} assigned to Garimpeiro`);
        return task;
      }
    }
    return null;
  }

  // Recebe os dados extraídos pelo Garimpeiro e aciona a IA
  async submitTaskData(taskId: string, scrapedData: any) {
    const task = this.laboratoryTasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (scrapedData.error) {
      task.status = 'ERROR';
      task.error = scrapedData.error;
      this.laboratoryTasks.set(taskId, task);
      return { success: true };
    }

    task.scrapedData = scrapedData;
    this.laboratoryTasks.set(taskId, task);

    this.logger.log(`[Laboratory] Received data for task ${taskId}. Analyzing with AI...`);
    
    try {
      const analysisJson = await this.aiService.analyzeProduct({
        title: scrapedData.title,
        price: scrapedData.price,
        originalPrice: scrapedData.originalPrice,
        discountPercentage: scrapedData.discountPercentage,
        permalink: scrapedData.permalink,
        image: scrapedData.pictureUrl
      });
      
      task.analysisResult = {
        ...analysisJson,
        _raw: {
          title: scrapedData.title,
          price: scrapedData.price,
          originalPrice: scrapedData.originalPrice,
          discountPercentage: scrapedData.discountPercentage,
          link: scrapedData.permalink || task.url,
          image: scrapedData.pictureUrl
        }
      };
      task.status = 'COMPLETED';
      this.laboratoryTasks.set(taskId, task);
      this.logger.log(`[Laboratory] AI Analysis completed for task ${taskId}`);
    } catch (err) {
      this.logger.error(`[Laboratory] AI Analysis failed for task ${taskId}:`, err);
      task.status = 'ERROR';
      task.error = 'Falha na análise da IA';
      this.laboratoryTasks.set(taskId, task);
    }

    return { success: true };
  }

  // Antigo método não será mais usado, mas vou mantê-lo ou substituí-lo
  async analyzeManualOffer(url: string) {
    throw new Error('Endpoint depreciado. Use a fila de tarefas.');
  }

  async publishManualOffer(analysisData: any) {
    this.logger.log(`[Laboratory] Publishing manual offer: ${analysisData._raw.title}`);
    
    let message = await this.aiService.generateCopy(analysisData);
    const { title, price, link, image } = analysisData._raw;

    if (message.includes('{{LINK_AFILIADO}}')) {
      message = message.replace('{{LINK_AFILIADO}}', link);
    } else {
      message = message + '\n\n👉 Confira aqui: ' + link;
    }

    if (image) {
      await this.evolutionService.sendMediaMessage(this.TARGET_GROUP_JID, message, image);
    } else {
      await this.evolutionService.sendTextMessage(this.TARGET_GROUP_JID, message);
    }

    const dbProduct = await this.prisma.produto.create({
      data: {
        titulo: title,
        precoAtual: price,
        imagem: image || '',
        linkOriginal: link,
        dataPromocao: new Date(),
        nicho: analysisData?.nicho || null,
        publicoAlvo: analysisData?.publico_alvo || null,
        intencaoCompra: analysisData?.intencao_compra || null,
        score: analysisData?.score ? parseInt(analysisData.score) : null,
        prioridade: analysisData?.prioridade || null,
        gatilhos: analysisData?.gatilhos || [],
        beneficios: analysisData?.beneficios || [],
        doresResolvidas: analysisData?.dores_resolvidas || [],
        palavrasImpacto: analysisData?.palavras_impacto || [],
        linksAfiliado: {
          create: {
            linkOriginal: link,
            linkGerado: link,
            plataforma: 'MERCADOLIVRE'
          }
        }
      }
    });

    this.logger.log(`[Laboratory] Published and saved to DB with ID: ${dbProduct.id}`);
    return { success: true, productId: dbProduct.id };
  }
}
