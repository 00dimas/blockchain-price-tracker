import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PriceService } from './price.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @ApiOperation({ summary: 'Save new price data' })
  @ApiBody({
    schema: {
      properties: {
        chain: { type: 'string', example: 'ETHEREUM' },
        price: { type: 'number', example: 3500 },
      },
    },
  })
  @Post()
  async savePrice(@Body() body: { chain: string; price: number }) {
    return this.priceService.savePrice(body.chain, body.price);
  }

  @ApiOperation({ summary: 'Get latest price history for the last 24 hours' })
  @ApiQuery({ name: 'chain', type: 'string', required: true, example: 'ETHEREUM' })
  @Get()
  async getPrices(@Query('chain') chain: string) {
    return this.priceService.getPricesLast24Hours(chain);
  }

  @ApiOperation({ summary: 'Get historical prices for the last 24 hours' })
  @ApiQuery({ name: 'chain', type: 'string', required: true, example: 'ETHEREUM' })
  @Get('history')
  async getPriceHistory(@Query('chain') chain: string) {
    return this.priceService.getPricesLast24Hours(chain);
  }

  @ApiOperation({ summary: 'Set a price alert' })
  @ApiBody({
    schema: {
      properties: {
        chain: { type: 'string', example: 'ETHEREUM' },
        price: { type: 'number', example: 4000 },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @Post('alert')
  async setPriceAlert(@Body() { chain, price, email }: { chain: string; price: number; email: string }) {
    return this.priceService.setPriceAlert(chain, price, email);
  }

  @ApiOperation({ 
    summary: 'Send email with the latest price (Test Email Service)',
    description: 'This endpoint is used to test if the email service is working correctly. It sends an email with the latest price of the specified chain to the given email address.'
  })
  @ApiBody({
    schema: {
      properties: {
        chain: { type: 'string', example: 'ETHEREUM', description: 'Blockchain name (e.g., ETHEREUM, POLYGON)' },
        email: { type: 'string', example: 'user@example.com', description: 'Recipient email address' },
      },
    },
  })
  @Post('send-price-email')
  async sendPriceEmail(@Body() body: { chain: string; email: string }) {
    return this.priceService.sendLatestPriceEmail(body.chain, body.email);
  }
}
