import { ICommand } from './ICommand';

export class CloseCommand implements ICommand {
  readonly name: string = 'close';
  constructor() {}

  setArguments(args: string[]): void {
    throw new Error('Method not implemented.');
  }

  execute(): void {
    throw new Error('Method not implemented.');
  }
}
