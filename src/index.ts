require('dotenv').config();
import stringifyCsv from 'csv-stringify/lib/sync';
import parseCsv from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MarketApiService } from './services/MarketApiService';
import {Position, PositionWithComputedData} from './interfaces/Position'
import 'colors';
import { PositionsLogger } from './helpers/PositionsLogger';

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
    fs.writeFileSync(path.join(__dirname, '../positions.csv'), stringifyCsv([headers]));
    return;
  }

  if (args.open) {
    const openArgs = {
      ticker: _args.ticker,
      amount: parseFloat(_args.amount),
      price: parseFloat(_args.price),
      date: _args.date && new Date(_args.date),
    };
    if (!openArgs.ticker || !openArgs.amount || !openArgs.price) {
      console.log(`${'ERR'.red} --ticker, --price, and --amount must be present to open a position`);
      return;
    }

    const position = [openArgs.date || Date.now(), openArgs.ticker, openArgs.amount, openArgs.price, 'OPEN', undefined];

    const hash = crypto
      .createHash('sha256')
      .update(stringifyCsv([position]))
      .digest('hex');
    position.unshift(hash);

    fs.appendFileSync(path.join(__dirname, '../positions.csv'), stringifyCsv([position]));
    console.log(`${'OK'.green} Bought ${openArgs.amount} ${openArgs.ticker} for $${openArgs.price}`);

    return;
  }

  if (args.close) {
    const closeArgs = {
      id: _args._[1],
      closingPrice: _args.price,
    };
    if (!closeArgs.id || !closeArgs.closingPrice) {
      console.log(`${'ERR'.red} --id and --price must be present to close a position`);
      return;
    }
    const csv = fs.readFileSync(path.join(__dirname, '../positions.csv'));
    const positions: any[] = parseCsv(csv, {
      cast: true,
      columns: true,
    });

    const position = positions.find((p) => p.id === closeArgs.id || p.id.substring(0, 7) === closeArgs.id);

    position.status = 'CLOSED';
    position.closing_price = closeArgs.closingPrice;

    fs.writeFileSync(path.join(__dirname, '../positions.csv'), stringifyCsv(positions, { header: true }));
    return;
  }

  if (args.log) {
    const logArgs = {
      all: true,
      cumulative: _args.cumulative || false,
      avg: _args.avg || false,
      positions: _args.positions || false,
    };

    logArgs.all = !(logArgs.cumulative || logArgs.avg || logArgs.positions);

    const marketApi = new MarketApiService(process.env.API_KEY);
    const ticker = await marketApi.getSymbolPriceTicker();

    const csv = fs.readFileSync(path.join(__dirname, '../positions.csv'));
    const positions: Position[] = parseCsv(csv, {
      cast: true,
      columns: ['id', 'date', 'ticker', 'amount', 'openingPrice', 'status', 'closingPrice'],
    });

    const positionsWithComputedData: PositionWithComputedData[] = positions.map(pos => {
      const currentPrice = parseFloat(ticker.find(x => x.symbol === `${pos.ticker}USDT`)?.price);
      const currentCost = pos.amount * currentPrice;
      const openingCost = pos.amount * pos.openingPrice;
      return {
        ...pos,
        currentPrice: currentPrice,
        currentCost: currentCost,
        openingCost: openingCost,
        gainLoss: (currentCost/openingCost - 1) * 100
      }
    });

    const logger = new PositionsLogger(positionsWithComputedData);

    (logArgs.all || logArgs.positions) && logger.logPositions();
    (logArgs.all || logArgs.cumulative) && logger.logCumulative();
    (logArgs.all || logArgs.avg) && logger.logAvgCostPerCurreny();
  }
})();
