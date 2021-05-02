import { ICommand } from "./ICommand";

export class LogCommand implements ICommand {
  name: string;
  setArguments(args: string[]): void {
    throw new Error("Method not implemented.");
  }
  execute(): void {
    throw new Error("Method not implemented.");
  }

}