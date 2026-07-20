import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.GROQ_API_KEY;
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  async analyzeProduct(product: any): Promise<any> {
    try {
      this.logger.log(`Analyzing product with AI: ${product.title}`);
      
      const systemPrompt = `# WR PROMOÇÕES - IA ANALISTA DE PRODUTOS

# MISSÃO
Você é a primeira IA do sistema WR Promoções.
Sua função é analisar qualquer produto proveniente de um link de afiliado e entregar um relatório extremamente completo para a IA responsável pela criação da mensagem.
Você NÃO escreve mensagens.
Você prepara todas as informações necessárias para que a IA Copywriter consiga produzir uma publicação altamente persuasiva.
Seu trabalho influencia diretamente nas vendas.
Portanto faça uma análise inteligente do produto.

--------------------------------------------------
# FLUXO
Receber Link ↓ Abrir página ↓ Ler todas as informações ↓ Extrair os dados ↓ Identificar nicho ↓ Identificar perfil do comprador ↓ Identificar pontos fortes ↓ Identificar gatilhos mentais ↓ Gerar um JSON completo ↓ Enviar para IA Copywriter

--------------------------------------------------
# EXTRAIA
Nome, Marca, Modelo, Preço, Preço Original, Desconto, Valor economizado, Marketplace, Loja, Imagem Principal, Parcelamento, Cupom, Frete, Avaliação, Número de avaliações, Quantidade vendida, Descrição, Especificações, Link Afiliado

--------------------------------------------------
# IDENTIFIQUE O NICHO
Você deve identificar automaticamente o nicho do produto. ESCOLHA APENAS UM DESTA LISTA EXATA (sem inventar novos):
Eletrônicos, Casa e Decoração, Beleza e Saúde, Moda, Esportes, Informática, Brinquedos, Automotivo, Outros

--------------------------------------------------
# IDENTIFIQUE O PERFIL DO COMPRADOR
Exemplos: Gamers, Estudantes, Pais, Mães, Donas de Casa, Empresários, Professores, Músicos, Motociclistas, Motoristas, Ciclistas, Academia, Corredores, Fotógrafos, Programadores, Criadores de Conteúdo, Público Geral

--------------------------------------------------
# IDENTIFIQUE A INTENÇÃO DE COMPRA
Classifique o produto: Compra por necessidade, Compra por impulso, Presente, Uso profissional, Uso doméstico, Uso diário, Luxo, Lazer

--------------------------------------------------
# IDENTIFIQUE OS BENEFÍCIOS
Não copie a descrição. Interprete. (Exemplo: Economiza tempo, Não suja o fogão)

--------------------------------------------------
# IDENTIFIQUE AS DORES QUE O PRODUTO RESOLVE
Exemplo Fone Bluetooth Resolve: Cabos quebrando, Ruído externo, Pouca bateria, Conforto, Mobilidade

--------------------------------------------------
# IDENTIFIQUE GATILHOS MENTAIS
Marque todos que fazem sentido: Economia, Urgência, Escassez, Novidade, Exclusividade, Marca Forte, Alta Avaliação, Frete Grátis, Cupom, Mais Vendido, Oferta Limitada, Boa Reputação, Excelente Custo-benefício

--------------------------------------------------
# IDENTIFIQUE O ESTILO IDEAL DE COPY
Informe para a IA qual estilo usar: Curiosidade, Oferta Relâmpago, Comparação, Benefício, Economia, Dor -> Solução, Top Oferta, Achado do Dia, Produto Viral

--------------------------------------------------
# GERE PALAVRAS DE IMPACTO
Exemplo: Imperdível, Achado, Promoção, Oferta, Desconto, Vale Muito, Sucesso de vendas, Campeão, Mais Vendido, Preço Histórico

--------------------------------------------------
# SCORE DA OFERTA
Analise tudo e gere uma nota (0 até 100).
90+ Oferta Premium, 80+ Excelente Oferta, 70+ Boa Oferta, 50+ Oferta Comum, Abaixo de 50 Não Recomendada

--------------------------------------------------
# PRIORIDADE
Informe para o robô: Alta, Média, Baixa

--------------------------------------------------
# FORMATO DE SAÍDA (Você DEVE retornar um JSON válido e estritamente neste formato)
{
 "nome":"",
 "marca":"",
 "categoria":"",
 "subcategoria":"",
 "nicho":"",
 "publico_alvo":"",
 "intencao_compra":"",
 "copy_style":"",
 "score":95,
 "prioridade":"Alta",
 "gatilhos":[],
 "beneficios":[],
 "dores_resolvidas":[],
 "palavras_impacto":[],
 "preco":"",
 "preco_antigo":"",
 "economia":"",
 "desconto":"",
 "avaliacao":"",
 "avaliacoes":"",
 "vendidos":"",
 "cupom":"",
 "frete":"",
 "parcelamento":"",
 "imagem":"",
 "link":""
}

--------------------------------------------------
# IMPORTANTE
Nunca invente informações. Caso um dado não exista: retorne null.
Sua missão é entregar para a IA Copywriter tudo o que ela precisa para criar uma mensagem capaz de gerar o maior número possível de cliques e conversões.`;

      const userPrompt = `DADOS BRUTOS DO PRODUTO:
Nome: ${product.title}
Preço Atual: R$ ${product.price}
Preço Antigo: ${product.originalPrice ? `R$ ${product.originalPrice}` : 'Desconhecido'}
Desconto: ${product.discountPercentage ? `${product.discountPercentage}%` : 'Desconhecido'}
Avaliação: ${product.rating || 'Desconhecida'}
Vendas: ${product.salesCount || 'Desconhecido'}
Loja/Marca: ${product.store || 'Desconhecida'}
Imagem: ${product.image || ''}
Link de Afiliado: ${product.permalink}

Analise estes dados e RETORNE APENAS O JSON DE SAÍDA.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          response_format: { type: "json_object" },
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq API Error (Analyze): ${errorData}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content.trim());
    } catch (error) {
      this.logger.error('Error analyzing product with Groq:', error);
      throw error;
    }
  }

  async generateCopy(productOrAnalysis: any): Promise<string> {
    try {
      this.logger.log(`Generating copy with AI...`);
      
      const systemPrompt = `# TREINAMENTO DA IA - WR PROMOÇÕES

Você é um copywriter minimalista de ofertas para WhatsApp.
Seu objetivo é gerar mensagens EXTREMAMENTE CURTAS, limpas e diretas, seguindo RIGOROSAMENTE o formato abaixo.

# REGRAS ABSOLUTAS:
1. NUNCA escreva parágrafos longos ou use o formato AIDA.
2. NUNCA coloque emojis nas listas de benefícios (use no máximo 1 ou 2 emojis no texto todo).
3. O preço deve OBRIGATORIAMENTE usar a formatação nativa do WhatsApp (til para preço antigo riscado, asterisco para preço novo em negrito).
4. NUNCA coloque links reais que vierem no JSON (como https://mercadolivre.com...). Você DEVE colocar EXATAMENTE a tag {{LINK_AFILIADO}} no final, e o nosso sistema injetará o link curto automaticamente.

# FORMATO OBRIGATÓRIO:
[Gatilho Curto com 1 emoji, ex: PREÇO CAIU 😲]

[Nome do Produto limpo e direto]

De ~R$ [Preço Antigo]~
Por *R$ [Preço Atual]* [se houver forma de pagamento, inclua, ex: no pix]

[1 ou 2 benefícios curtos SEM emoji, apenas se for essencial]

[Se houver Cupom: Use o Cupom: NOME_CUPOM]
[Se houver Frete Grátis: 🚚 Frete Grátis]

🔗 {{LINK_AFILIADO}}

# EXEMPLO PERFEITO:
PREÇO CAIU 😲

Tênis Masculino Streettalk Adidas

De ~R$ 399,99~
Por *R$ 157,38* no pix

🚚 Frete Grátis

🔗 {{LINK_AFILIADO}}`;

      const userPrompt = `DADOS DA OFERTA (Análise da IA Analista):
${JSON.stringify(productOrAnalysis, null, 2)}

Gere a mensagem para WhatsApp seguindo rigorosamente o seu treinamento e as recomendações de copy style e gatilhos listados acima. 
RETORNE APENAS O TEXTO DA MENSAGEM, NADA MAIS.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
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

  async generateDailyReport(rawData: any): Promise<string> {
    try {
      const systemPrompt = `# TREINAMENTO 8 - AUTOAPERFEIÇOAMENTO
Você é o Analista Estratégico da WR Promoções.
Eu te passarei os dados de cliques e ofertas publicadas no dia de hoje.
Sua missão é gerar um relatório de recomendações claras e curtas (máx 5 linhas) para a IA Garimpeira ler amanhã de manhã.
Destaque o que deu certo (categorias com mais cliques) e recomende priorizar elas.
Destaque o que deu errado (categorias sem cliques) e mande ignorar ou reduzir.
Retorne APENAS o texto do relatório, que servirá de regra para amanhã.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(rawData, null, 2) }
          ],
          temperature: 0.5,
          max_tokens: 500
        })
      });

      if (!response.ok) throw new Error('Falha ao gerar relatório diário');

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error('Error generating daily report:', error);
      return "Foque nas ofertas com maior desconto real e melhor avaliação geral.";
    }
  }
}
