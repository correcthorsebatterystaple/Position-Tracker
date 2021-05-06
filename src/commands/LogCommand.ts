import minimist from 'minimist';
import { PositionsLogger } from '../helpers/PositionsLogger';
import { ICommand } from '../interfaces/ICommand';
import { ILogCommandArgs } from '../interfaces/ILogCommandArgs';
import { Position, PositionWithComputedData } from '../interfaces/Position';
import { PositionRepository } from '../repositories/PositionRepository';
import { MarketApiService } from '../services/MarketApiService';

export class LogCommand implements ICommand {
  name: string = 'log';
  private args: ILogCommandArgs;
  private positionRepository = new PositionRepository();
  private marketApiService = new MarketApiService(process.env.API_KEY);

  constructor() {}

  setArguments(args: string[]): void {
    const parseArgs = minimist(args, {
      boolean: ['avg', 'cumulative', 'positions', 'all'],
      alias: {
        a: 'avg',
        c: 'cumulative',
        p: 'positions',
        x: 'all',
      },
    });

    this.args = {
      avg: parseArgs.avg,
      positions: parseArgs.positions,
      cumulative: parseArgs.cumulative,
      all: parseArgs.all,
    };
  }

  async execute() {
    const ticker = this.marketApiService.getSymbolPriceTicker();
    const positions = this.positionRepository.getAllPositions();

    const positionsWithComputedData = this.computeAdditionalPositionInfo(await positions, await ticker);
    const logger = new PositionsLogger(positionsWithComputedData);

    if (this.args.all || this.args.positions) {
      logger.logPositions();
    }
    if (this.args.all || this.args.avg) {
      logger.logAvgCostPerCurreny();
    }
    if (this.args.all || this.args.cumulative) {
      logger.logCumulative();
    }
  }

  private computeAdditionalPositionInfo(positions: Position[], ticker: any[]): PositionWithComputedData[] {
    return positions
      .map((pos) => {
        const currentPrice = parseFloat(
          ticker.find((x: { symbol: string }) => x.symbol === `${pos.ticker}USDT`)?.price
        );
        const currentCost = pos.amount * currentPrice;
        const openingCost = pos.amount * pos.openingPrice;
        return {
          ...pos,
          currentPrice: currentPrice,
          currentCost: currentCost,
          openingCost: openingCost,
          gainLoss: currentCost - openingCost,
          gainLossPercentage: (currentCost / openingCost - 1) * 100,
        };
      });
  }
}
