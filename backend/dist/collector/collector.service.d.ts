import { MercadoLivreService } from '../mercadolivre/mercadolivre.service';
import { AiService } from '../ai/ai.service';
import { EvolutionService } from '../evolution/evolution.service';
export declare class CollectorService {
    private readonly mlService;
    private readonly aiService;
    private readonly evolutionService;
    private readonly logger;
    private readonly TARGET_GROUP_JID;
    constructor(mlService: MercadoLivreService, aiService: AiService, evolutionService: EvolutionService);
    handleCron(): Promise<void>;
    collectAndPostOffer(query?: string): Promise<void>;
}
