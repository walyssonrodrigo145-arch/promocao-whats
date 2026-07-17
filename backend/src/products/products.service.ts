import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, q?: string) {
    const ontem = new Date();
    ontem.setHours(ontem.getHours() - 24);

    const whereClause: any = {
      dataPromocao: {
        gte: ontem
      }
    };

    if (category) {
      whereClause.nicho = { contains: category, mode: 'insensitive' as const };
    }
    if (q) {
      whereClause.titulo = { contains: q, mode: 'insensitive' as const };
    }

    return this.prisma.produto.findMany({
      where: whereClause,
      orderBy: { dataPromocao: 'desc' },
      take: 40,
      include: {
        linksAfiliado: true
      }
    });
  }
}
