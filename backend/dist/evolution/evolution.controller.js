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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionController = void 0;
const common_1 = require("@nestjs/common");
const evolution_service_1 = require("./evolution.service");
let EvolutionController = class EvolutionController {
    evolutionService;
    constructor(evolutionService) {
        this.evolutionService = evolutionService;
    }
    async getQrCode(instanceName, res) {
        try {
            const data = await this.evolutionService.getQrCode(instanceName);
            if (data?.instance?.state === 'open' || data?.state === 'open') {
                return res.send(`
          <html>
            <body style="font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
              <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #4CAF50;">✅ WhatsApp Conectado!</h1>
                <p>A instância já está conectada e pronta para enviar mensagens.</p>
              </div>
            </body>
          </html>
        `);
            }
            const base64Qr = data.base64 || data?.qrcode?.base64;
            if (!base64Qr) {
                return res.send(`
          <html>
            <body style="font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
              <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #FF9800;">Aguardando...</h1>
                <p>Não foi possível obter o QR Code. A instância pode estar em outro estado ou conectando.</p>
                <p><pre>${JSON.stringify(data, null, 2)}</pre></p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; margin-top: 20px;">Recarregar</button>
              </div>
            </body>
          </html>
        `);
            }
            return res.send(`
        <html>
          <body style="font-family: Arial; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2>Escaneie o QR Code no seu WhatsApp</h2>
              <p>Instância: <strong>${instanceName || 'Padrão'}</strong></p>
              <img src="${base64Qr}" alt="QR Code" style="width: 300px; height: 300px; border: 1px solid #ccc; border-radius: 8px; margin: 20px 0;" />
              <br/>
              <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #008CBA; color: white; border: none; border-radius: 5px;">Atualizar QR Code</button>
            </div>
          </body>
        </html>
      `);
        }
        catch (error) {
            return res.status(500).send(`Erro ao buscar QR Code: ${error.message}`);
        }
    }
    async getGroups(instanceName) {
        try {
            const groups = await this.evolutionService.getGroups(instanceName);
            return groups;
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.EvolutionController = EvolutionController;
__decorate([
    (0, common_1.Get)('qrcode'),
    __param(0, (0, common_1.Query)('instance')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "getQrCode", null);
__decorate([
    (0, common_1.Get)('groups'),
    __param(0, (0, common_1.Query)('instance')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "getGroups", null);
exports.EvolutionController = EvolutionController = __decorate([
    (0, common_1.Controller)('api/evolution'),
    __metadata("design:paramtypes", [evolution_service_1.EvolutionService])
], EvolutionController);
//# sourceMappingURL=evolution.controller.js.map