import minimist from 'minimist';
import { ICloseCommandArgs } from '../interfaces/ICloseCommandArgs';
import { ICommand } from '../interfaces/ICommand';
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
      boolean: 'partial',
      alias: {
        i: 'id',
        p: 'price',
        a: 'amount'
      },
    });

    this.args = {
      price: parsedArgs.price,
      id: parsedArgs.id,
      partial: parsedArgs.partial,
      amount: parsedArgs.amount,
    };

    if (!this.args.id || !this.args.price) {
      throw new Error('--id and --price must be provided');
    }
    if (this.args.partial && !this.args.amount) {
      throw new Error('--amount must be provided when --partial is provided');
    }
  }

  async execute() {
    if (this.args.partial) {
      const position = await this.positionRepository.getPositionById(this.args.id, false);

      if (this.args.amount > position.amount) {
        throw new Error(`Closing amount cannot be greater than existing amount: ${position.amount-this.args.amount}`);
      }

      // add new closed postion with amount and closing price
      await this.positionRepository.insertPosition({
        ...position,
        status: PositionStatus.CLOSED,
        amount: this.args.amount,
        closing_price: this.args.price,
      });
      // update amount on old position
      await this.positionRepository.updatePosition(this.args.id, {
        amount: position.amount - this.args.amount,
      });
      return;
    }
    await this.positionRepository.updatePosition(this.args.id, {
      closing_price: this.args.price,
      status: PositionStatus.CLOSED,
    });
  }
}
