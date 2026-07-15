import { EvolutionService } from './evolution.service';
import type { Response } from 'express';
export declare class EvolutionController {
    private readonly evolutionService;
    constructor(evolutionService: EvolutionService);
    getQrCode(instanceName: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getGroups(instanceName: string): Promise<any>;
}
