"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoLivreModule = void 0;
const common_1 = require("@nestjs/common");
const mercadolivre_service_1 = require("./mercadolivre.service");
const mercadolivre_controller_1 = require("./mercadolivre.controller");
let MercadoLivreModule = class MercadoLivreModule {
};
exports.MercadoLivreModule = MercadoLivreModule;
exports.MercadoLivreModule = MercadoLivreModule = __decorate([
    (0, common_1.Module)({
        providers: [mercadolivre_service_1.MercadoLivreService],
        controllers: [mercadolivre_controller_1.MercadoLivreController],
        exports: [mercadolivre_service_1.MercadoLivreService],
    })
], MercadoLivreModule);
//# sourceMappingURL=mercadolivre.module.js.map