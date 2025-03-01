import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './price.entity';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { PriceCron } from './price.cron';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Price]), EmailModule],
  providers: [PriceService, PriceCron],
  controllers: [PriceController],
})
export class PriceModule {}
