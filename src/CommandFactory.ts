import { ICommand } from './commands/ICommand';
import { ICommandData } from './commands/ICommandData';

export class CommandFactory {
  private commandMapping: ICommand[] = [];
  private defaultCommand: ICommand = undefined;
  constructor() {}

  create(data: ICommandData): ICommand {
    const command = this.commandMapping.find((cmd) => cmd.name === data.name) || this.defaultCommand;
    command.setArguments(data.args);

    return command;
  }
}
