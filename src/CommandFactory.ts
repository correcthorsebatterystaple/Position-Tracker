import { CloseCommand } from './commands/CloseCommand';
import { ICommand } from './interfaces/ICommand';
import { ICommandData } from './interfaces/ICommandData';
import { LogCommand } from './commands/LogCommand';
import { OpenCommand } from './commands/OpenCommand';
import { PriceCommand } from './commands/PriceCommand';
import { BuyCommand } from './commands/BuyCommand';

export class CommandFactory {
  private commandMapping: ICommand[] = [
    new OpenCommand(),
    new CloseCommand(),
    new PriceCommand(),
    new LogCommand(),
    new BuyCommand(),
  ];
  constructor() {
    // do nothing
  }

  create(data: ICommandData): ICommand {
    const command = this.commandMapping.find((cmd) => cmd.name === data.name);

    if (!command) {
      throw new Error(`Command does not exist: ${data.name}`);
    }

    command.setArguments(data.args);
    return command;
  }
}
