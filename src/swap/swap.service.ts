import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SwapService {
  private readonly logger = new Logger(SwapService.name);
  private readonly MORALIS_API_KEY = process.env.MORALIS_API_KEY;

  private readonly contractAddresses: { [key: string]: { address: string; chain: string } } = {
    eth: { address: '0xC02aaa39b223FE8D0A0E5C4F27eAD9083C756Cc2', chain: 'eth' },
    polygon: { address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', chain: 'polygon' },
    btc: { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', chain: 'eth' },
  };

  async fetchPrice(asset: string): Promise<number> {
    const assetData = this.contractAddresses[asset];

    if (!assetData) {
      this.logger.error(`❌ Contract address for ${asset} not found`);
      throw new Error(`Contract address for ${asset} not found`);
    }

    try {
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2/erc20/${assetData.address}/price?chain=${assetData.chain}`,
        {
          headers: { 'X-API-Key': this.MORALIS_API_KEY },
        }
      );

      return response.data.usdPrice;
    } catch (error: any) {
      const errorMessage = error.response
        ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}`
        : error.message || 'Unknown error';

      this.logger.error(`❌ Failed to fetch ${asset.toUpperCase()} price: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  async calculateSwapRate(ethAmount: number) {
    if (!ethAmount || ethAmount <= 0) {
      throw new Error('❌ Invalid ETH amount');
    }

    try {
      const ethPrice = await this.fetchPrice('eth');
      const btcPrice = await this.fetchPrice('btc');

      if (!ethPrice || !btcPrice) {
        throw new Error('❌ Failed to fetch required prices');
      }

      const btcEquivalent = (ethAmount * ethPrice) / btcPrice;
      const feeBtc = btcEquivalent * 0.03;
      const feeEth = ethAmount * 0.03;
      const feeUsd = feeEth * ethPrice;
      const finalAmountBtc = btcEquivalent - feeBtc;

      return {
        btcEquivalent,
        feeBtc,
        finalAmountBtc,
        feeEth,
        feeUsd,
        ethPrice,
        btcPrice,
        feePercentage: 0.03,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error calculating swap rate: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }
}
