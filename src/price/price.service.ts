import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Price } from './price.entity';
import { EmailService } from '../email/email.service';

interface PriceAlert {
  chain: string;
  price: number;
  email: string;
}

@Injectable()
export class PriceService {
  private priceAlerts: PriceAlert[] = [];

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private readonly emailService: EmailService,
  ) {}

  async savePrice(chain: string, price: number): Promise<Price> {
    const newPrice = this.priceRepository.create({ chain, price });
    const savedPrice = await this.priceRepository.save(newPrice);

    this.checkPriceAlerts(chain, price);

    return savedPrice;
  }

  async getPricesLast24Hours(chain: string): Promise<Price[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    return this.priceRepository.find({
      where: { chain, createdAt: MoreThan(oneDayAgo) },
      order: { createdAt: 'DESC' },
    });
  }

  async setPriceAlert(chain: string, price: number, email: string): Promise<string> {
    this.priceAlerts.push({ chain, price, email });
    return `Alert set for ${chain} at $${price}, email will be sent to ${email}`;
  }

  private async checkPriceAlerts(chain: string, currentPrice: number) {
    for (const alert of this.priceAlerts) {
      if (alert.chain === chain && currentPrice >= alert.price) {
        await this.emailService.sendAlertEmail(chain, currentPrice);
        this.priceAlerts = this.priceAlerts.filter(a => a !== alert);
      }
    }
  }

  async sendLatestPriceEmail(chain: string, email: string): Promise<string> {
    const latestPrice = await this.priceRepository.findOne({
      where: { chain },
      order: { createdAt: 'DESC' },
    });

    if (!latestPrice) {
      return `No price data found for ${chain}`;
    }

    await this.emailService.sendPriceEmail(chain, latestPrice.price, email);

    return `Email sent to ${email} with the latest price of ${chain}: $${latestPrice.price}`;
  }
}
