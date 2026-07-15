"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorModule = void 0;
const common_1 = require("@nestjs/common");
const collector_service_1 = require("./collector.service");
const mercadolivre_module_1 = require("../mercadolivre/mercadolivre.module");
const ai_module_1 = require("../ai/ai.module");
const evolution_module_1 = require("../evolution/evolution.module");
const collector_controller_1 = require("./collector.controller");
let CollectorModule = class CollectorModule {
};
exports.CollectorModule = CollectorModule;
exports.CollectorModule = CollectorModule = __decorate([
    (0, common_1.Module)({
        imports: [mercadolivre_module_1.MercadoLivreModule, ai_module_1.AiModule, evolution_module_1.EvolutionModule],
        providers: [collector_service_1.CollectorService],
        controllers: [collector_controller_1.CollectorController]
    })
], CollectorModule);
//# sourceMappingURL=collector.module.js.map