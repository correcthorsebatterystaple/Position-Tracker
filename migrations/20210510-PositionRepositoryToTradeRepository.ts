import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import parseCsv from 'csv-parse/lib/sync';
import currency from 'currency.js';

const args = minimist(process.argv.slice(2));
const positionsFilepath = path.join(process.cwd(), args.positions);
const tradesFilepath = path.join(process.cwd(), args.trades);

const positionsCsv = fs.readFileSync(positionsFilepath);

const positionsData: any[] = parseCsv(positionsCsv, {
  cast: true,
  trim: true,
  columns: true,
});

const trades: string[][] = [];
for (const pos of positionsData) {
  if (pos.status === 'OPEN') {
    trades.push([
      pos.id,
      pos.date,
      pos.ticker,
      pos.amount,
      'USDT',
      currency(pos.opening_price, { precision: 5 }).multiply(pos.amount),
    ]);
  }
  if (pos.status === 'CLOSED') {
    trades.push([
      pos.id,
      pos.date,
      pos.ticker,
      pos.amount,
      'USDT',
      currency(pos.opening_price, { precision: 5 }).multiply(pos.amount).toJSON(),
    ]);
    trades.push([
      pos.id,
      pos.date,
      'USDT',
      currency(pos.closing_price, { precision: 5 }).multiply(pos.amount).toJSON(),
      pos.ticker,
      pos.amount,
    ]);
  }
}

const tradeHeaders = 'id,date,buySymbol,buyAmount,sellSymbol,sellAmount\n';
const tradeBody = trades
  .map((trade) => trade.join(','))
  .join('\n')
  .concat('\n');

fs.writeFileSync(tradesFilepath, tradeHeaders.concat(tradeBody));
