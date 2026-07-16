import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const whereClause = category 
      ? { nicho: { contains: category, mode: 'insensitive' as const } } 
      : {};

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
