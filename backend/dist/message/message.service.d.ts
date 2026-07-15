import { EvolutionService } from '../evolution/evolution.service';
export declare class MessageService {
    private readonly evolutionService;
    private readonly logger;
    constructor(evolutionService: EvolutionService);
    sendTestMessage(jid: string, instanceName?: string): Promise<any>;
}
