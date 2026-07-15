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
var MessageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const evolution_service_1 = require("../evolution/evolution.service");
let MessageService = MessageService_1 = class MessageService {
    evolutionService;
    logger = new common_1.Logger(MessageService_1.name);
    constructor(evolutionService) {
        this.evolutionService = evolutionService;
    }
    async sendTestMessage(jid, instanceName) {
        try {
            this.logger.log(`Sending test message to ${jid}`);
            const text = 'Olá! 👋 Esta é uma mensagem de teste enviada pelo seu novo robô MusicPro!';
            const response = await this.evolutionService.sendTextMessage(jid, text, instanceName);
            return response;
        }
        catch (error) {
            this.logger.error('Failed to send test message:', error);
            throw error;
        }
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = MessageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [evolution_service_1.EvolutionService])
], MessageService);
//# sourceMappingURL=message.service.js.map