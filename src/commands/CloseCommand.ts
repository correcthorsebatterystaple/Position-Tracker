import minimist from 'minimist';
import { ICloseCommandArgs } from './interfaces/ICloseCommandArgs';
import { ICommand } from './interfaces/ICommand';
import { promises as fs } from 'fs';
import parseCsv from 'csv-parse/lib/sync';
import path from 'path';
import { Position } from '../interfaces/Position';
import stringifyCsv from 'csv-stringify/lib/sync';

export class CloseCommand implements ICommand {
  readonly name: string = 'close';
  private args: ICloseCommandArgs;

  constructor() {}

  setArguments(args: string[]): void {
    const parsedArgs = minimist(args, {
      string: 'id',
      alias: {
        i: 'id',
        p: 'price',
      },
    });

    this.args = {
      price: parsedArgs.price,
      id: parsedArgs.id,
    };

    if (!this.args.id || !this.args.price) {
      throw new Error('--id and --ticker must be provided');
    }
  }

  async execute() {
    const csv = await fs.readFile(path.join(path.dirname(require.main.filename), 'positions.csv'), 'utf-8');
    const positions = parseCsv(csv, {
      cast: true,
      columns: ['id', 'date', 'ticker', 'amount', 'opening_price', 'status', 'closing_price'],
      trim: true,
      fromLine: 2,
    });

    const positionToClose = positions.find((pos) => pos.id === this.args.id || pos.id.substring(0, 7) === this.args.id);
    if (!positionToClose) {
      throw new Error(`Position not found: ${this.args.id}`);
    }

    positionToClose.status = 'CLOSED';
    positionToClose.closing_price = this.args.price;

    const updatedCsv = stringifyCsv(positions, {
      header: true,
    });

    await fs.writeFile(path.join(path.dirname(require.main.filename), 'positions.csv'), updatedCsv);
  }
}
