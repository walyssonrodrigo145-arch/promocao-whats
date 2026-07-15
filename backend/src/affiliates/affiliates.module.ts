import { Module } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';

@Module({
  providers: [AffiliatesService]
})
export class AffiliatesModule {}
