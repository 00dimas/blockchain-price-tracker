import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PriceService } from './price.service';
import { EmailService } from '../email/email.service';
import axios from 'axios';
import * as cron from 'node-cron';

@Injectable()
export class PriceCron implements OnModuleInit {
  private readonly logger = new Logger(PriceCron.name);

  constructor(
    private readonly priceService: PriceService,
    private readonly emailService: EmailService,
  ) {}

  async fetchPrice(chain: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2/erc20/price?chain=${chain}`,
        {
          headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
        }
      );
      
      return response.data.usdPrice;
    } catch (error: any) {
      this.logger.error(`Failed to fetch ${chain} price: ${error.message || JSON.stringify(error)}`);
      return 0;
    }
  }

  async checkPriceIncrease(chain: string, newPrice: number) {
    const prices = await this.priceService.getPricesLast24Hours(chain);
    if (prices.length > 0) {
      const oneHourAgoPrice = prices[0].price;
      const increasePercent = ((newPrice - oneHourAgoPrice) / oneHourAgoPrice) * 100;

      if (increasePercent > 3) {
        this.logger.warn(`🚨 ALERT: ${chain} price increased by ${increasePercent.toFixed(2)}%!`);
        await this.emailService.sendAlertEmail(chain, newPrice);
      }
    }
  }

  async savePrice() {
    const chains = [
      { name: 'eth', display: 'ETHEREUM' },
      { name: 'polygon', display: 'POLYGON' },
    ];

    for (const chain of chains) {
      const price = await this.fetchPrice(chain.name);
      if (price > 0) {
        await this.priceService.savePrice(chain.display, price);
        await this.checkPriceIncrease(chain.display, price);
        this.logger.log(`Saved ${chain.display} price: $${price}`);
      }
    }
  }

  onModuleInit() {
    this.logger.log('Starting price cron job...');
    cron.schedule('*/5 * * * *', async () => {
      this.logger.log('Fetching prices from Moralis...');
      await this.savePrice();
    });
  }
}
