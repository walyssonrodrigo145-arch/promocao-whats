import type { Response } from 'express';
import { MercadoLivreService } from './mercadolivre.service';
export declare class MercadoLivreController {
    private readonly mlService;
    constructor(mlService: MercadoLivreService);
    login(res: Response): void;
    callback(code: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
