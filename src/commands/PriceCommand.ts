import { ICommand } from './interfaces/ICommand';

export class PriceCommand implements ICommand {
  constructor() {}
  name: string;
  setArguments(args: string[]): void {
    throw new Error('Method not implemented.');
  }
  execute(): void {
    throw new Error('Method not implemented.');
  }
}
