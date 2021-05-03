require('dotenv').config();
import stringifyCsv from 'csv-stringify/lib/sync';
import parseCsv from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MarketApiService } from './services/MarketApiService';
import { Position, PositionWithComputedData } from './interfaces/Position';
import 'colors';
import { PositionsLogger } from './helpers/PositionsLogger';
import { Logger } from './helpers/Logger';
import { OpenCommand } from './commands/OpenCommand';
import { CloseCommand } from './commands/CloseCommand';
import { PriceCommand } from './commands/PriceCommand';
import { LogCommand } from './commands/LogCommand';

(async function main() {
  const _args = require('minimist')(process.argv.slice(2));

  const args = {
    init: _args._[0] === 'init',
    open: _args._[0] === 'open',
    close: _args._[0] === 'close',
    log: _args._[0] === 'log',
    price: _args._[0] === 'price',
    test: _args._[0] === 'test',
  };

  if (args.init) {
    const headers = ['id', 'date', 'ticker', 'amount', 'opening_price', 'status', 'closing_price'];
    fs.writeFileSync(path.join(__dirname, '../positions.csv'), stringifyCsv([headers]));
    return;
  }

  if (args.open) {
    const command = new OpenCommand();
    command.setArguments(process.argv.slice(3));
    await command.execute();
    return;
  }

  if (args.close) {
    const command = new CloseCommand();
    command.setArguments(process.argv.slice(3));
    await command.execute();
    return;
  }

  if (args.log) {
    const command = new LogCommand();
    command.setArguments(process.argv.slice(3));
    await command.execute();
    return;
  }

  if (args.price) {
    const command = new PriceCommand();
    command.setArguments(process.argv.slice(3));
    await command.execute();
    return;
  }

  if (args.test) {
    return;
  }
})();
