import minimist from 'minimist';
import { CommandFactory } from './CommandFactory';
import { ICommandData } from './interfaces/ICommandData';

export class Processor {
  private commandFactory: CommandFactory;
  constructor() {
    const commandFactory = new CommandFactory();
  }

  async process(args: string[]) {
    const commandData = this.parseArguments(args);
    const command = this.commandFactory.create(commandData)

    await command.execute();
  }

  private parseArguments(args: string[]): ICommandData {
    return {
      name: args[0],
      args: args.slice(1),
    };
  }
}
