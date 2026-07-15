import { Module } from '@nestjs/common';
import { MercadoLivreService } from './mercadolivre.service';
import { MercadoLivreController } from './mercadolivre.controller';

@Module({
  providers: [MercadoLivreService],
  controllers: [MercadoLivreController],
  exports: [MercadoLivreService],
})
export class MercadoLivreModule {}
