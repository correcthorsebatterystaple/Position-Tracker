import { ICommand } from './commands/ICommand';
import { ICommandData } from './commands/ICommandData';

export class CommandFactory {
  private commandMapping: ICommand[] = [];
  private defaultCommand: ICommand = undefined;
  constructor() {}

  create(data: ICommandData): ICommand {
    return this.commandMapping.find(cmd => cmd.name === data.name) || this.defaultCommand;
  }
}
