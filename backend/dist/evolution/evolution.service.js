"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EvolutionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionService = void 0;
const common_1 = require("@nestjs/common");
let EvolutionService = EvolutionService_1 = class EvolutionService {
    logger = new common_1.Logger(EvolutionService_1.name);
    apiUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '');
    apiToken = process.env.EVOLUTION_API_TOKEN;
    defaultInstance = process.env.EVOLUTION_INSTANCE_NAME || 'wrmusic';
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'apikey': this.apiToken,
        };
    }
    async getQrCode(instanceName = this.defaultInstance) {
        try {
            this.logger.log(`Fetching QR Code for instance: ${instanceName}`);
            const response = await fetch(`${this.apiUrl}/instance/connect/${instanceName}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 404 || data.message?.includes('not found')) {
                    this.logger.warn(`Instance ${instanceName} not found. Trying to create it...`);
                    await this.createInstance(instanceName);
                    return this.getQrCode(instanceName);
                }
                throw new Error(data.message || 'Failed to connect instance');
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error fetching QR code:', error);
            throw error;
        }
    }
    async createInstance(instanceName) {
        this.logger.log(`Creating instance: ${instanceName}`);
        const response = await fetch(`${this.apiUrl}/instance/create`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                instanceName,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS',
            }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to create instance');
        }
        return response.json();
    }
    async getGroups(instanceName = this.defaultInstance) {
        try {
            this.logger.log(`Fetching groups for instance: ${instanceName}`);
            const response = await fetch(`${this.apiUrl}/group/fetchAll/${instanceName}?getParticipants=false`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch groups');
            }
            return response.json();
        }
        catch (error) {
            this.logger.error('Error fetching groups:', error);
            throw error;
        }
    }
    async sendTextMessage(jid, text, instanceName = this.defaultInstance) {
        try {
            this.logger.log(`Sending message to ${jid} via instance ${instanceName}`);
            const response = await fetch(`${this.apiUrl}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    number: jid,
                    options: {
                        delay: 1200,
                        presence: 'composing',
                    },
                    text: text,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send message');
            }
            return data;
        }
        catch (error) {
            this.logger.error(`Error sending message to ${jid}:`, error);
            throw error;
        }
    }
    async sendMediaMessage(jid, caption, mediaUrl, instanceName = this.defaultInstance) {
        try {
            this.logger.log(`Sending media message to ${jid} via instance ${instanceName}`);
            const response = await fetch(`${this.apiUrl}/message/sendMedia/${instanceName}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    number: jid,
                    mediatype: "image",
                    mimetype: "image/jpeg",
                    caption: caption,
                    media: mediaUrl,
                    options: {
                        delay: 1200,
                        presence: 'composing',
                    }
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send media message');
            }
            return data;
        }
        catch (error) {
            this.logger.error(`Error sending media message to ${jid}:`, error);
            throw error;
        }
    }
};
exports.EvolutionService = EvolutionService;
exports.EvolutionService = EvolutionService = EvolutionService_1 = __decorate([
    (0, common_1.Injectable)()
], EvolutionService);
//# sourceMappingURL=evolution.service.js.map