import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: string, @Query('q') q?: string) {
    return this.productsService.findAll(category, q);
  }

  @Delete('removpromo/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
