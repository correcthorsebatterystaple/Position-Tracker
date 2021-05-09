import minimist from 'minimist';
import { Logger } from '../helpers/Logger';
import { ICommand } from '../interfaces/ICommand';
import { Trade } from '../models/Trade';
import { TradeRepository } from '../repositories/TradeRepository';

export class BuyCommand implements ICommand {
  name = 'buy';
  private args: { symbol: string; cost: number; amount: number; date: string };
  private readonly OTHER_SYMBOL = 'USDT';
  private tradeRepository = new TradeRepository();

  constructor() {
    // do nothing
  }

  setArguments(args: string[]): void {
    const parsedArgs = minimist(args, { string: ['symbol'] });
    this.args = {
      date: parsedArgs.date,
      symbol: parsedArgs.symbol,
      cost: parsedArgs.cost,
      amount: parsedArgs.amount,
    };

    if (!(this.args.amount && this.args.cost && this.args.symbol)) {
      throw new Error('--symbol, --price and --amount are required parameters');
    }
  }

  async execute(): Promise<void> {
    const trade: Omit<Trade, 'id'> = {
      date: new Date(this.args.date ?? Date.now()).valueOf(),
      buySymbol: this.args.symbol.toUpperCase(),
      buyAmount: this.args.amount,
      sellAmount: this.args.cost,
      sellSymbol: this.OTHER_SYMBOL,
    };

    await this.tradeRepository.addTrade(trade);

    Logger.OK(`Bought ${this.args.symbol.toUpperCase()} for $${this.args.cost}`);
  }
}
