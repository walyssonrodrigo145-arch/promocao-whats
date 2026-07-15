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
var CollectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mercadolivre_service_1 = require("../mercadolivre/mercadolivre.service");
const ai_service_1 = require("../ai/ai.service");
const evolution_service_1 = require("../evolution/evolution.service");
let CollectorService = CollectorService_1 = class CollectorService {
    mlService;
    aiService;
    evolutionService;
    logger = new common_1.Logger(CollectorService_1.name);
    TARGET_GROUP_JID = '120363427056717824@g.us';
    constructor(mlService, aiService, evolutionService) {
        this.mlService = mlService;
        this.aiService = aiService;
        this.evolutionService = evolutionService;
    }
    async handleCron() {
        this.logger.log('Starting scheduled offer collection...');
        await this.collectAndPostOffer();
    }
    async collectAndPostOffer(query = 'promoção relâmpago') {
        try {
            this.logger.log('Fetching offers from Mercado Livre...');
            const offers = await this.mlService.searchOffers(query, 5);
            if (!offers || offers.length === 0) {
                this.logger.warn('No offers found.');
                return;
            }
            const topOffer = offers[0];
            const itemDetails = await this.mlService.getItemDetails(topOffer.id);
            const imageUrl = itemDetails.pictures && itemDetails.pictures.length > 0
                ? itemDetails.pictures[0].url
                : itemDetails.thumbnail;
            const productInfo = {
                title: itemDetails.title,
                price: itemDetails.price,
                permalink: itemDetails.permalink,
            };
            this.logger.log('Generating AI copy...');
            const copy = await this.aiService.generateCopy(productInfo);
            this.logger.log(`Sending message to WhatsApp group ${this.TARGET_GROUP_JID}...`);
            if (imageUrl) {
                await this.evolutionService.sendMediaMessage(this.TARGET_GROUP_JID, copy, imageUrl);
            }
            else {
                await this.evolutionService.sendTextMessage(this.TARGET_GROUP_JID, copy);
            }
            this.logger.log('Offer successfully posted!');
        }
        catch (error) {
            this.logger.error('Error during collect and post routine:', error);
        }
    }
};
exports.CollectorService = CollectorService;
__decorate([
    (0, schedule_1.Cron)('0 */4 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CollectorService.prototype, "handleCron", null);
exports.CollectorService = CollectorService = CollectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mercadolivre_service_1.MercadoLivreService,
        ai_service_1.AiService,
        evolution_service_1.EvolutionService])
], CollectorService);
//# sourceMappingURL=collector.service.js.map