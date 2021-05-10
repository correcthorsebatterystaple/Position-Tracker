import minimist from 'minimist';
import { Logger } from '../helpers/Logger';
import { ICommand } from '../interfaces/ICommand';
import { Trade } from '../models/Trade';
import { TradeRepository } from '../repositories/TradeRepository';

export class SellCommand implements ICommand {
  name = 'sell';
  private args: { symbol: string; cost: number; amount: number; date: string };
  private readonly OTHER_SYMBOL = 'USDT';
  private readonly tradeRepository = new TradeRepository();

  constructor() {
    // do nothing
  }
  setArguments(args: string[]): void {
    const parsedArgs = minimist(args);
    this.args = {
      symbol: parsedArgs.symbol,
      cost: parsedArgs.cost,
      amount: parsedArgs.amount,
      date: parsedArgs.date,
    };

    if (!(this.args.cost && this.args.symbol && this.args.amount)) {
      throw new Error('--symbol, --cost and --amount must be provided');
    }
  }
  async execute(): Promise<void> {
    const trade: Omit<Trade, 'id'> = {
      date: new Date(this.args.date ?? Date.now()).valueOf(),
      buySymbol: this.OTHER_SYMBOL,
      buyAmount: this.args.cost,
      sellAmount: this.args.amount,
      sellSymbol: this.args.symbol,
    };

    await this.tradeRepository.addTrade(trade);

    Logger.OK(`Sold ${this.args.symbol.toUpperCase()} for $${this.args.cost}`);
  }
}
