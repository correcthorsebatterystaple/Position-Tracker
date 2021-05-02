import { ICommand } from "./interfaces/ICommand";

export class LogCommand implements ICommand {
  name: string;
  setArguments(args: string[]): void {
    throw new Error("Method not implemented.");
  }
  async execute() {
    throw new Error("Method not implemented.");
  }

}