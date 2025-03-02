import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';

@Controller('swap')
export class SwapController {
  @Get('rate')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    if (!ethAmount) {
      return { error: 'ethAmount is required' };
    }

    try {
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2/erc20/price?chain=eth`,
        {
          headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
        }
      );

      const ethPrice = response.data.usdPrice;
      const btcPrice = await this.getBtcPrice();

      const btcEquivalent = (ethAmount * ethPrice) / btcPrice;
      const fee = btcEquivalent * 0.03;
      const finalAmount = btcEquivalent - fee;

      return {
        btcEquivalent,
        fee,
        finalAmount,
        ethPrice,
        btcPrice,
        feePercentage: 0.03,
      };
    } catch (error: any) {
      return { error: `Error fetching swap rate: ${error.message || error}` };
    }
  }

  private async getBtcPrice() {
    try {
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2/erc20/price?chain=eth`,
        {
          headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
        }
      );
      return response.data.usdPrice;
    } catch (error) {
      throw new Error('Failed to fetch BTC price');
    }
  }
}
