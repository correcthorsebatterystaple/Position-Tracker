import 'colors';

export class Logger {
  static OK(message: string): void {
    console.log(`${'OK'.green}\t${message}`);
  }

  static ERR(message: string): void {
    console.log(`${'ERR'.red}\t${message}`);
  }

  static LOG(message: string): void {
    console.log(`\t${message}`);
  }
}
