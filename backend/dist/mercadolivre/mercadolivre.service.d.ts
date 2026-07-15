import { PrismaService } from '../prisma/prisma.service';
export declare class MercadoLivreService {
    private readonly prisma;
    private readonly logger;
    private readonly appId;
    private readonly clientSecret;
    private readonly redirectUri;
    constructor(prisma: PrismaService);
    getAuthorizationUrl(): string;
    exchangeCodeForToken(code: string): Promise<any>;
    private saveTokens;
    getValidAccessToken(): Promise<string | null>;
    searchOffers(query?: string, limit?: number): Promise<any[]>;
    getItemDetails(itemId: string): Promise<any>;
}
