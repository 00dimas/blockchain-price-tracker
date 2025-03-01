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
}
