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
    const contractAddresses: { [key: string]: string } = {
      eth: '0xC02aaa39b223FE8D0A0E5C4F27eAD9083C756Cc2',
      polygon: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    };

    if (!contractAddresses[chain]) {
      this.logger.error(`Contract address for ${chain} not found`);
      return 0;
    }

    try {
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2/erc20/${contractAddresses[chain]}/price?chain=${chain}`,
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
