"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    apiKey = process.env.GROQ_API_KEY;
    apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    async generateCopy(product) {
        try {
            this.logger.log(`Generating copy for product: ${product.title}`);
            const prompt = `Você é um especialista em Copywriting de afiliação para grupos de WhatsApp.
Crie uma mensagem curta, escandalosa (usando gatilhos de urgência e FOMO) para vender o seguinte produto:

Nome do Produto: ${product.title}
Preço Atual: R$ ${product.price}
Link: ${product.permalink}

Regras:
1. Comece com um emoji chamativo e uma frase de impacto (Ex: "🚨 BUGOU TUDO!" ou "😱 CORRE QUE VAI ACABAR!").
2. Destaque o preço atual.
3. Coloque o link de forma clara.
4. Use quebras de linha para ficar fácil de ler no celular.
5. Termine com um aviso de que os estoques acabam rápido.
6. NÃO invente cupons que não existem.
7. Retorne APENAS o texto da mensagem, sem explicações adicionais.`;
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-70b-8192',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Groq API Error: ${errorData}`);
            }
            const data = await response.json();
            return data.choices[0].message.content.trim();
        }
        catch (error) {
            this.logger.error('Error generating copy with Groq:', error);
            throw error;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map