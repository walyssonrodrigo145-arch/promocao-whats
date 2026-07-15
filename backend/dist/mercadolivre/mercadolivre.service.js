"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MercadoLivreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoLivreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MercadoLivreService = MercadoLivreService_1 = class MercadoLivreService {
    prisma;
    logger = new common_1.Logger(MercadoLivreService_1.name);
    appId = process.env.ML_APP_ID;
    clientSecret = process.env.ML_CLIENT_SECRET;
    redirectUri = process.env.ML_REDIRECT_URI;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAuthorizationUrl() {
        return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${this.appId}&redirect_uri=${this.redirectUri}`;
    }
    async exchangeCodeForToken(code) {
        try {
            this.logger.log('Exchanging code for token...');
            const response = await fetch('https://api.mercadolibre.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: this.appId,
                    client_secret: this.clientSecret,
                    code: code,
                    redirect_uri: this.redirectUri
                })
            });
            const data = await response.json();
            if (!response.ok) {
                this.logger.error('Error from ML API:', data);
                throw new Error(data.message || 'Failed to exchange token');
            }
            await this.saveTokens(data.access_token, data.refresh_token);
            return data;
        }
        catch (error) {
            this.logger.error('Failed to exchange code for token', error);
            throw error;
        }
    }
    async saveTokens(accessToken, refreshToken) {
        await this.prisma.config.upsert({
            where: { chave: 'ML_ACCESS_TOKEN' },
            update: { valor: accessToken },
            create: { chave: 'ML_ACCESS_TOKEN', valor: accessToken }
        });
        if (refreshToken) {
            await this.prisma.config.upsert({
                where: { chave: 'ML_REFRESH_TOKEN' },
                update: { valor: refreshToken },
                create: { chave: 'ML_REFRESH_TOKEN', valor: refreshToken }
            });
        }
        this.logger.log('Mercado Livre tokens saved to database.');
    }
    async getValidAccessToken() {
        const config = await this.prisma.config.findUnique({
            where: { chave: 'ML_ACCESS_TOKEN' }
        });
        return config ? config.valor : null;
    }
    async searchOffers(query = 'promoção', limit = 5) {
        try {
            this.logger.log(`Searching Mercado Livre for offers with query: ${query}`);
            const token = await this.getValidAccessToken();
            const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limit}&condition=new`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Failed to search offers on ML: ${err}`);
            }
            const data = await response.json();
            return data.results;
        }
        catch (error) {
            this.logger.error('Error searching offers:', error);
            throw error;
        }
    }
    async getItemDetails(itemId) {
        try {
            this.logger.log(`Fetching item details for ${itemId}`);
            const token = await this.getValidAccessToken();
            const response = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Failed to fetch item ${itemId}: ${err}`);
            }
            return response.json();
        }
        catch (error) {
            this.logger.error('Error fetching item details:', error);
            throw error;
        }
    }
};
exports.MercadoLivreService = MercadoLivreService;
exports.MercadoLivreService = MercadoLivreService = MercadoLivreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MercadoLivreService);
//# sourceMappingURL=mercadolivre.service.js.map