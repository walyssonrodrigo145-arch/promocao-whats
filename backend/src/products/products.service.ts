import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.produto.findMany({
      orderBy: { dataPromocao: 'desc' },
      take: 40,
      include: {
        linksAfiliado: true
      }
    });
  }
}
