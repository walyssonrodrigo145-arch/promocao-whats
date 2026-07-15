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
exports.CollectorController = void 0;
const common_1 = require("@nestjs/common");
const collector_service_1 = require("./collector.service");
let CollectorController = class CollectorController {
    collectorService;
    constructor(collectorService) {
        this.collectorService = collectorService;
    }
    async triggerCollection(query) {
        this.collectorService.collectAndPostOffer(query || 'promoção relâmpago').catch(console.error);
        return { success: true, message: 'Collection triggered in background.' };
    }
};
exports.CollectorController = CollectorController;
__decorate([
    (0, common_1.Post)('trigger'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "triggerCollection", null);
exports.CollectorController = CollectorController = __decorate([
    (0, common_1.Controller)('collector'),
    __metadata("design:paramtypes", [collector_service_1.CollectorService])
], CollectorController);
//# sourceMappingURL=collector.controller.js.map