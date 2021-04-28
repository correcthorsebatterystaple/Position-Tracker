import 'colors';

export class Logger {
  static OK(message: string) {
    console.log(`${'OK'.green}\t${message}`);
  }

  static ERR(message: string) {
    console.log(`${'ERR'.red}\t${message}`);
  }

  static LOG(message: string) {
    console.log(`\t${message}`);
  }
}
