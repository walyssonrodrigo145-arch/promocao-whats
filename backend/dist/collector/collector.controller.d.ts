import { CollectorService } from './collector.service';
export declare class CollectorController {
    private readonly collectorService;
    constructor(collectorService: CollectorService);
    triggerCollection(query: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
