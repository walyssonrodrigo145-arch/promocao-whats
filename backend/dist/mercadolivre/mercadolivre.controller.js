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
exports.MercadoLivreController = void 0;
const common_1 = require("@nestjs/common");
const mercadolivre_service_1 = require("./mercadolivre.service");
let MercadoLivreController = class MercadoLivreController {
    mlService;
    constructor(mlService) {
        this.mlService = mlService;
    }
    login(res) {
        const url = this.mlService.getAuthorizationUrl();
        return res.redirect(url);
    }
    async callback(code, res) {
        if (!code) {
            return res.status(400).send('Código de autorização não fornecido pelo Mercado Livre.');
        }
        try {
            await this.mlService.exchangeCodeForToken(code);
            return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="color: #4CAF50;">✅ Autorização Concluída!</h1>
              <p>O aplicativo foi vinculado com sucesso à sua conta do Mercado Livre.</p>
              <p>Os tokens foram salvos no banco de dados. Você já pode fechar esta aba.</p>
            </div>
          </body>
        </html>
      `);
        }
        catch (error) {
            return res.status(500).send('Erro ao processar a autenticação. Verifique os logs do servidor.');
        }
    }
};
exports.MercadoLivreController = MercadoLivreController;
__decorate([
    (0, common_1.Get)('mercadolivre/auth'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MercadoLivreController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('auth/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MercadoLivreController.prototype, "callback", null);
exports.MercadoLivreController = MercadoLivreController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [mercadolivre_service_1.MercadoLivreService])
], MercadoLivreController);
//# sourceMappingURL=mercadolivre.controller.js.map