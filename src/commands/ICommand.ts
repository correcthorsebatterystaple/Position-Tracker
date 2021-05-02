export interface ICommand {
  name: string;
  args: {[option: string]: string}
  setArguments: (args: {[option: string]: string}) => void,
  execute: () => void;
}