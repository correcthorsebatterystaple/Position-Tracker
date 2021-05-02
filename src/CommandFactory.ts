import { ICommand } from './commands/ICommand';
import { ICommandData } from './commands/ICommandData';
import { OpenCommand } from './commands/OpenCommand';

export class CommandFactory {
  private commandMapping: ICommand[] = [new OpenCommand()];
  constructor() {}

  create(data: ICommandData): ICommand {
    const command = this.commandMapping.find((cmd) => cmd.name === data.name);

    if (!command) {
      throw new Error(`Command does not exist: ${data.name}`);
    }

    command.setArguments(data.args);
    return command;
  }
}
