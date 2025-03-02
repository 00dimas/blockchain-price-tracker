import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Get('rate')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    if (!ethAmount) {
      throw new BadRequestException('ethAmount is required');
    }

    try {
      return await this.swapService.calculateSwapRate(ethAmount);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }
  }
}
