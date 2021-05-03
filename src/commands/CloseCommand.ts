import minimist from 'minimist';
import { ICloseCommandArgs } from './interfaces/ICloseCommandArgs';
import { ICommand } from './interfaces/ICommand';
import { PositionRepository } from '../repositories/PositionRepository';
import { PositionStatus } from '../enums/PositionStatusEnum';

export class CloseCommand implements ICommand {
  readonly name: string = 'close';
  private args: ICloseCommandArgs;
  private positionRepository = new PositionRepository();

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
    await this.positionRepository.updatePosition(this.args.id, {
      closing_price: this.args.price,
      status: PositionStatus.CLOSED,
    });
  }
}
