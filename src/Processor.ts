import minimist from 'minimist';
import { CommandFactory } from './CommandFactory';
import { ICommandData } from './commands/ICommandData';

export class Processor {
  private commandFactory: CommandFactory;
  constructor() {
    const commandFactory = new CommandFactory();
  }

  process(args: string[]): void {
    const commandData = this.parseArguments(args);
    const command = this.commandFactory.create(commandData)

    command.execute();
  }

  private parseArguments(args: string[]): ICommandData {
    return {
      name: args[0],
      args: args.slice(1),
    };
  }
}
