import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.GROQ_API_KEY;
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  async generateCopy(product: any): Promise<string> {
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
          model: 'mixtral-8x7b-32768',
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
    } catch (error) {
      this.logger.error('Error generating copy with Groq:', error);
      throw error;
    }
  }
}
