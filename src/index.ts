require('dotenv').config();
import stringifyCsv from 'csv-stringify/lib/sync';
import parseCsv from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import uuid from 'uuid';
import crypto from 'crypto';
import { MarketApiService } from './services/MarketApiService';
import 'colors';
import { printTable, Table } from 'console-table-printer';

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

    const position = positions.find((p) => p.id === closeArgs.id || p.id.substring(0, 7) === closeArgs.id);

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
        const res = {
          id: p.id.substring(0, 7).concat('...'),
          date: new Date(p.date).toLocaleString(),
          ticker: p.ticker,
          amount: p.amount,
          openingPrice: p.opening_price,
          // 'current price': symbolPrice,
          // 'opening total': openingTotal,
          // 'current total': currentTotal,
          // 'gain/loss': ((currentTotal - openingTotal) / openingTotal),
        };
        return res;
      })
      .sort();

    const getCurrentPrice = (symbol) => {
      return parseFloat(ticker.find((t) => t.symbol === `${symbol}USDT`)?.price);
    };
    const getGainLossPercentage = (symbol, openingPrice, amount) => {
      const currentTotal = amount * getCurrentPrice(symbol);
      const openingTotal = amount * openingPrice;
      return (currentTotal / openingTotal - 1) * 100;
    };

    const table = new Table({
      sort: (a, b) => (a.ticker > b.ticker ? -1 : a.ticker < b.ticker ? 1 : 0),
      columns: [
        { name: 'id' },
        { name: 'date' },
        { name: 'ticker' },
        { name: 'amount' },
        { name: 'openingPrice', title: 'opening price' },
      ],
      computedColumns: [
        {
          name: 'current price',
          function: (v) => getCurrentPrice(v.ticker).toPrecision(5),
        },
        {
          name: 'opening total',
          function: (v) => (v.amount * v.openingPrice).toPrecision(5),
        },
        {
          name: 'current total',
          function: (v) => (v.amount * getCurrentPrice(v.ticker)).toPrecision(5),
        },
        {
          name: 'gain/loss',
          function: (v) => getGainLossPercentage(v.ticker, v.openingPrice, v.amount).toPrecision(3) + '%',
        },
      ],
    });
    positionsDisplay.forEach((p) => {
      table.addRow(p);
    });
    table.table.rows.forEach( r => {
      const gainLoss = getGainLossPercentage(r.text.ticker, r.text.openingPrice, r.text.amount);
      if (gainLoss >= 0) r.color = 'green';
      else r.color = 'red';
    });
    table.printTable();
    console.log(`Cum. Opening total: ${positions.reduce((acc, p) => acc + p.opening_price * p.amount, 0)}`);
    return;
  }
})();
