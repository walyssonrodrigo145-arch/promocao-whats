import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

@Injectable()
export class AiLearningService {
  private readonly logger = new Logger(AiLearningService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) {}

  @Cron('50 23 * * *')
  async fecharDiaEGerarRelatorio() {
    this.logger.log('Iniciando o Fechamento Diário de Inteligência Comercial (Treinamento 8)...');
    
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Busca todos os produtos lançados hoje com seus links e cliques
      const produtosHoje = await this.prisma.produto.findMany({
        where: {
          dataPromocao: {
            gte: hoje
          }
        },
        include: {
          linksAfiliado: {
            include: {
              cliques: true
            }
          }
        }
      });

      let totalOfertas = produtosHoje.length;
      let totalCliques = 0;
      let categoriasDesempenho: Record<string, { cliques: number, produtos: number }> = {};

      produtosHoje.forEach(p => {
        const cliquesNoProduto = p.linksAfiliado.reduce((acc, link) => acc + link.cliques.length, 0);
        totalCliques += cliquesNoProduto;
        
        const nicho = p.nicho || 'Outros';
        if (!categoriasDesempenho[nicho]) {
          categoriasDesempenho[nicho] = { cliques: 0, produtos: 0 };
        }
        categoriasDesempenho[nicho].produtos += 1;
        categoriasDesempenho[nicho].cliques += cliquesNoProduto;
      });

      const rawData = {
        data: new Date().toISOString(),
        totalOfertasPublicadas: totalOfertas,
        totalCliquesRecebidos: totalCliques,
        desempenhoPorCategoria: categoriasDesempenho
      };

      this.logger.log('Enviando dados para a Groq gerar o Relatório de Aprendizado...');
      
      // Envia os dados para a IA analisar
      const relatorioGerado = await this.aiService.generateDailyReport(rawData);

      // Salva o relatório no banco
      await this.prisma.config.upsert({
        where: { chave: 'LAST_AI_REPORT' },
        update: { valor: relatorioGerado },
        create: { chave: 'LAST_AI_REPORT', valor: relatorioGerado }
      });

      this.logger.log('✅ Relatório de Autoaperfeiçoamento salvo com sucesso!');
    } catch (error) {
      this.logger.error('Erro ao gerar relatório de inteligência', error);
    }
  }

  async getLatestReport(): Promise<string | null> {
    const config = await this.prisma.config.findUnique({
      where: { chave: 'LAST_AI_REPORT' }
    });
    return config ? config.valor : null;
  }
}
