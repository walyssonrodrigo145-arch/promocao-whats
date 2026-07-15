import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectorModule } from './collector/collector.module';
import { AiModule } from './ai/ai.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { MessageModule } from './message/message.module';
import { EvolutionModule } from './evolution/evolution.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    CollectorModule, 
    AiModule, 
    AffiliatesModule, 
    MessageModule, 
    EvolutionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
