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
      ticker: _args.ticker || _args.t,
      amount: parseFloat(_args.amount) || _args.a,
      price: parseFloat(_args.price) || _args.p,
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
      id: _args.id,
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

    if (!position || position.status === 'CLOSED') {
      console.log(`${'ERR'.red} No open position found with id ${closeArgs.id.substring(0,7)}...`);
      return;
    }

    position.status = 'CLOSED';
    position.closing_price = closeArgs.closingPrice;

    fs.writeFileSync(path.join(__dirname, '../positions.csv'), stringifyCsv(positions, { header: true }));
    console.log(`${'OK'.green} Sold ${position.amount} ${position.ticker} for $${closeArgs.closingPrice}`);
    const openingCost = position.amount * position.opening_price;
    const closingCost = position.amount * closeArgs.closingPrice;
    const gainLossPercent = (closingCost / openingCost - 1) * 100;
    const gainLoss = closingCost - openingCost;
    const isPositive = gainLoss > 0;
    console.log('   Gain/Loss: ' + `${gainLoss.toPrecision(5)} ${gainLossPercent.toFixed(3)}%`[isPositive ? 'green' : 'red']);
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

    const positionsWithComputedData: PositionWithComputedData[] = positions.map((pos) => {
      const currentPrice = parseFloat(ticker.find((x) => x.symbol === `${pos.ticker}USDT`)?.price);
      const currentCost = pos.amount * currentPrice;
      const openingCost = pos.amount * pos.openingPrice;
      return {
        ...pos,
        currentPrice: currentPrice,
        currentCost: currentCost,
        openingCost: openingCost,
        gainLoss: currentCost - openingCost,
        gainLossPercentage: (currentCost / openingCost - 1) * 100,
      };
    });

    const logger = new PositionsLogger(positionsWithComputedData);

    (logArgs.all || logArgs.positions) && logger.logPositions();
    (logArgs.all || logArgs.cumulative) && logger.logCumulative();
    (logArgs.all || logArgs.avg) && logger.logAvgCostPerCurreny();
  }
})();
