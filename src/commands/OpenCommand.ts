import minimist from 'minimist';
import { ICommand } from './interfaces/ICommand';
import crypto from 'crypto';
import stringifyCsv from 'csv-stringify/lib/sync';
import fs from 'fs';
import path from 'path';
import { IOpenCommandArgs } from './interfaces/IOpenCommandArgs';

export class OpenCommand implements ICommand {
  readonly name = 'open';
  private args: IOpenCommandArgs;
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
    const position = [
      this.args.date || Date.now(),
      this.args.ticker,
      this.args.amount,
      this.args.price,
      'OPEN',
      undefined,
    ];

    const hash = crypto
      .createHash('sha256')
      .update(stringifyCsv([position]))
      .digest('hex');
    position.unshift(hash);

    fs.appendFileSync(path.join(path.dirname(require.main.filename), './positions.csv'), stringifyCsv([position]));
    console.log(`Bought ${this.args.amount} ${this.args.ticker} at $${this.args.price}`);
  }
}
