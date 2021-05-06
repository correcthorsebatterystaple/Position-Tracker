require('dotenv').config();
import { Logger } from './helpers/Logger';
import { Processor } from './Processor';

(async function main() {
  const processor = new Processor();
  await processor.process(process.argv.slice(2));
})().catch(err => {
  Logger.ERR(err);
});
