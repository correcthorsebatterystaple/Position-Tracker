require('dotenv').config();
import stringifyCsv from 'csv-stringify/lib/sync';
import parseCsv from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import uuid from 'uuid';
import crypto from 'crypto';
import { MarketApiService } from './services/MarketApiService';
import 'colors';


(async function main() {
  const _args = require('minimist')(process.argv.slice(2));

  const args = {
    init: _args._[0] === 'init',
    open: _args._[0] === 'open',
    close: _args._[0] === 'close',
    log: _args._[0] === 'log',
  };

  if (args.init) {
    const headers = ['id', 'date', 'ticker', 'amount', 'opening_price', 'status', 'closing_price'];
    fs.writeFileSync(path.join(process.cwd(), 'positions.csv'), stringifyCsv([headers]));
    return;
  }

  if (args.open) {
    const addArgs = {
      ticker: _args.ticker,
      amount: parseFloat(_args.amount),
      price: parseFloat(_args.price),
    };
    console.log(addArgs);

    const position = [Date.now(), addArgs.ticker, addArgs.amount, addArgs.price, 'OPEN', undefined];

    const hash = crypto
      .createHash('sha256')
      .update(stringifyCsv([position]))
      .digest('hex');
    position.unshift(hash);

    fs.appendFileSync(path.join(process.cwd(), 'positions.csv'), stringifyCsv([position]));

    return;
  }

  if (args.close) {
    const closeArgs = {
      id: _args._[1],
      closingPrice: _args.price,
    };
    const csv = fs.readFileSync(path.join(process.cwd(), 'positions.csv'));
    const positions: any[] = parseCsv(csv, {
      cast: true,
      columns: true,
    });

    const position = positions.find((p) => p.id === closeArgs.id || p.id.substring(0,7) === closeArgs.id);

    position.status = 'CLOSED';
    position.closing_price = closeArgs.closingPrice;

    fs.writeFileSync(path.join(process.cwd(), 'positions.csv'), stringifyCsv(positions, { header: true }));
    return;
  }

  if (args.log) {
    const logArgs = {
      showAll: _args.all || false,
    };

    const marketApi = new MarketApiService(process.env.API_KEY);
    const ticker = await marketApi.getSymbolPriceTicker();

    const csv = fs.readFileSync(path.join(process.cwd(), 'positions.csv'));
    const positions: any[] = parseCsv(csv, {
      cast: true,
      columns: true,
    });

    const positionsDisplay = positions
      .filter((p) => p.status === 'OPEN' || logArgs.showAll)
      .map((p) => {
        console.log(p);
        const symbolPrice = parseFloat(ticker.find(t => t.symbol === `${p.ticker}USDT`)?.price);
        console.log({symbolPrice})
        const currentTotal = p.amount * symbolPrice;
        const openingTotal = p.amount * p.opening_price;
        const res = {
          id: p.id.substring(0,7).concat('...'),
          date: new Date(p.date).toLocaleString(),
          ticker: p.ticker,
          amount: p.amount.toPrecision(5),
          'opening total': openingTotal.toPrecision(5),
          'current total': currentTotal.toPrecision(5),
          'gain/loss': ((currentTotal-openingTotal)/openingTotal).toPrecision(5),
          status: p.status,
          'closing price': p.status === 'OPEN' ? undefined : p.closing_price,
        };
        return res;
      });
    console.table(positionsDisplay);
    return;
  }
})();
