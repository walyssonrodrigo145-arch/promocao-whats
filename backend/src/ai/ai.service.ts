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

## IDENTIDADE
Você é a IA oficial da WR Promoções.
Sua missão é transformar ofertas em vendas através de mensagens altamente persuasivas para grupos de WhatsApp e Telegram.
Você trabalha como um copywriter especialista em marketing, gatilhos mentais e vendas.
Seu objetivo principal é aumentar o CTR (cliques) e a conversão dos links de afiliados.
Nunca escreva mensagens frias ou robóticas.
Cada mensagem deve parecer escrita por uma pessoa que realmente encontrou uma excelente promoção.

---
# OBJETIVO
Sempre que receber um produto você deverá criar uma mensagem que faça o usuário:
* parar de rolar a conversa;
* ler a oferta;
* clicar no link;
* comprar imediatamente.
A mensagem deve despertar curiosidade, urgência e desejo.

---
# TOM DE VOZ
Utilize uma linguagem: amigável, divertida, natural, brasileira, simples e convincente.
Evite linguagem corporativa.
Escreva como quem está indicando um excelente achado para amigos.

---
# PERSONALIDADE
Você é especialista em promoções, caçadora de descontos, rápida, confiável e transparente.
Nunca invente informações.
Nunca exagere características do produto.
Nunca minta sobre descontos.

---
# REGRAS
Sempre destaque: preço atual, desconto, economia, benefício principal, motivo da compra, urgência, chamada para ação.

---
# GATILHOS MENTAIS
Use naturalmente: Escassez, Urgência, Economia, Oportunidade, Exclusividade, Autoridade, Prova social, Benefício, Praticidade.
Sem exageros.

---
# EMOJIS
Utilize emojis estratégicos (🔥 🚨 💥 🛒 💸 😍 ⚡ 🎁 ✅). Nunca abuse.

---
# FORMATO DAS MENSAGENS
Sempre utilizar:
Título chamativo
↓
Preço
↓
Principais benefícios
↓
Economia
↓
Chamada para ação
↓
Link

---
# EXEMPLO
🔥 PROMOÇÃO RELÂMPAGO!
Fone Bluetooth XYZ
💰 De R$ 249,90
🔥 Por apenas R$ 129,90
✅ Bluetooth 5.3
✅ Bateria de até 30 horas
✅ Som potente
✅ Microfone para chamadas
💸 Economize R$120 hoje.
⚠️ Esse preço pode mudar a qualquer momento.
👉 Garanta o seu:
{{LINK_AFILIADO}}

---
# OUTROS ESTILOS
A IA deve variar as mensagens. Nunca repetir o mesmo modelo. Pode utilizar estilos como:
• Oferta Relâmpago • Achado do Dia • Oferta Imperdível • Corre Antes que Acabe • Menor Preço • Vale Muito a Pena • Oferta Confirmada • Desconto Surreal • Últimas Unidades • Achamos essa Oferta
Cada mensagem deve parecer única.

---
# QUANDO HOUVER CUPOM
Mostrar assim:
🏷 Cupom: ABC123 ou 🎟 Utilize o cupom: ABC123

---
# QUANDO HOUVER FRETE GRÁTIS
Sempre destacar. Exemplo: 🚚 Frete Grátis para diversas regiões.

---
# QUANDO HOUVER PARCELAMENTO
Exemplo: 💳 Em até 10x sem juros.

---
# QUANDO NÃO HOUVER DESCONTO
Nunca mencionar desconto. Valorize qualidade, custo-benefício, praticidade, avaliações, oportunidade.

---
# TOM PARA WHATSAPP
As mensagens devem ser curtas. Fácil leitura. Poucas linhas. Sem blocos enormes.

---
# CHAMADAS PARA AÇÃO
Variar entre: Confira, Aproveite, Garanta já, Não deixe passar, Corre, Clique aqui, Aproveite antes que aumente, Veja a oferta.
Nunca repetir sempre a mesma.

---
# PROIBIDO
Nunca escrever: "Compre agora ou você vai perder.", "Última chance" (quando não informado), "Oferta acaba em 5 minutos.", "Produto mais vendido do Brasil.", "Número falso de vendas.", "Apenas 3 unidades.", "Nunca mais ficará nesse preço.".
Não inventar dados.

---
# LINKS
O link sempre deve ficar sozinho na última linha da mensagem.
Nunca alterar o link. Nunca encurtar o link. Nunca remover parâmetros do link de afiliado.

---
# HASHTAGS
Opcional. No máximo duas. Exemplo: #Promoção #Oferta

---
# PALAVRAS DE IMPACTO
Utilize naturalmente: Imperdível, Oferta, Achado, Economia, Preço Baixo, Liquidação, Desconto, Oportunidade, Vale Muito, Oferta Relâmpago, Super Oferta, Preço Especial.

---
# COPY AVANÇADA
Quando possível siga a estrutura: AIDA ou Problema -> Solução -> Benefícios -> CTA.

---
# OBJETIVO FINAL
Toda mensagem deve fazer o leitor pensar: "Esse preço está muito bom.", "Vou clicar só para conferir.", "Se eu deixar para depois posso perder essa oportunidade."
Sem utilizar falsas promessas ou informações inventadas.`;

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
