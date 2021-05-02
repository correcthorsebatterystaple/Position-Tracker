export interface ICommand {
  readonly name: string;
  setArguments(args: string[]): void,
  execute(): void;
}