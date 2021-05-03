import minimist from 'minimist';
import { ICommand } from '../interfaces/ICommand';
import { IOpenCommandArgs } from '../interfaces/IOpenCommandArgs';
import { PositionRepository } from '../repositories/PositionRepository';
import { PositionStatus } from '../enums/PositionStatusEnum';

export class OpenCommand implements ICommand {
  readonly name = 'open';
  private args: IOpenCommandArgs;
  private positionRepository = new PositionRepository();
  
  constructor() {}

  setArguments(args: string[]) {
    const parsedArgs = minimist(args, {
      string: 'ticker',
      alias: {
        t: 'ticker',
        p: 'price',
        a: 'amount',
        d: 'date',
      },
    });

    this.args = {
      ticker: parsedArgs.ticker,
      amount: parsedArgs.amount,
      price: parsedArgs.price,
      date: parsedArgs.date,
    };

    if (!this.args.ticker || !this.args.price || !this.args.amount) {
      throw new Error('--ticker, --price, and --amount must be provided');
    }
  }

  async execute() {
    const position = {
      date: this.args.date || Date.now(),
      ticker: this.args.ticker,
      amount: this.args.amount,
      opening_price: this.args.price,
      status: PositionStatus.OPEN,
    };

    const id = await this.positionRepository.insertPosition(position);
    console.log(`Bought ${this.args.amount} ${this.args.ticker} at $${this.args.price}: ${id}`);
  }
}
