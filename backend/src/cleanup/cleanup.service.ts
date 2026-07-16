import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  // Roda todos os dias às 03:00 da manhã
  @Cron('0 3 * * *')
  async cleanOldProducts() {
    this.logger.log('Iniciando rotina de limpeza de produtos antigos (mais de 48h)...');
    
    const limite = new Date();
    limite.setHours(limite.getHours() - 48);

    try {
      const produtosParaDeletar = await this.prisma.produto.findMany({
        where: {
          dataPromocao: {
            lt: limite
          }
        },
        select: { id: true }
      });

      if (produtosParaDeletar.length === 0) {
        this.logger.log('Nenhum produto antigo encontrado para deletar.');
        return;
      }

      const ids = produtosParaDeletar.map(p => p.id);

      // Deletar relações
      await this.prisma.linkAfiliado.deleteMany({ where: { produtoId: { in: ids } } });
      await this.prisma.promocao.deleteMany({ where: { produtoId: { in: ids } } });
      await this.prisma.historicoPreco.deleteMany({ where: { produtoId: { in: ids } } });

      // Deletar produtos
      const result = await this.prisma.produto.deleteMany({
        where: {
          id: { in: ids }
        }
      });

      this.logger.log(`Limpeza concluída! ${result.count} produtos e suas dependências foram removidos permanentemente do banco.`);
    } catch (error) {
      this.logger.error('Erro ao executar a rotina de limpeza de produtos antigos', error);
    }
  }
}
