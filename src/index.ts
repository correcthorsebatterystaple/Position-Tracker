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
    command.execute();
    return;
  }

  if (args.close) {
    const closeArgs = {
      id: _args.id,
      closingPrice: _args.price,
    };
    if (!closeArgs.id || !closeArgs.closingPrice) {
      Logger.ERR(`--id and --price must be present to close a position`);
      return;
    }
    const csv = fs.readFileSync(path.join(__dirname, '../positions.csv'));
    const positions: any[] = parseCsv(csv, {
      cast: true,
      columns: true,
    });

    const position = positions.find((p) => {
      return p.id === closeArgs.id || p.id.substring(0, 7) === closeArgs.id;
    });
    if (!position || position.status === 'CLOSED') {
      Logger.ERR(`No open position found with id ${closeArgs.id.substring(0, 7)}...`);
      return;
    }

    position.status = 'CLOSED';
    position.closing_price = closeArgs.closingPrice;

    fs.writeFileSync(path.join(__dirname, '../positions.csv'), stringifyCsv(positions, { header: true }));
    Logger.OK(`Sold ${position.amount} ${position.ticker} for $${closeArgs.closingPrice}`);
    const openingCost = position.amount * position.opening_price;
    const closingCost = position.amount * closeArgs.closingPrice;
    const gainLossPercent = (closingCost / openingCost - 1) * 100;
    const gainLoss = closingCost - openingCost;
    const isPositive = gainLoss > 0;
    Logger.LOG(
      'Gain/Loss: ' + `${gainLoss.toPrecision(5)} ${gainLossPercent.toFixed(3)}%`[isPositive ? 'green' : 'red']
    );
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

    const positionsWithComputedData: PositionWithComputedData[] = positions
      .filter((pos) => pos.status === 'OPEN')
      .map((pos) => {
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

  if (args.price) {
    const priceArgs = {
      ticker: _args.ticker || _args.t || false,
    };
    const marketApi = new MarketApiService(process.env.API_KEY);
    const [ticker] = await marketApi.getSymbolPriceTicker(priceArgs.ticker);

    if (!ticker) {
      Logger.ERR(`${priceArgs.ticker} not found`);
      return;
    }

    Logger.OK(`${priceArgs.ticker}: $${parseFloat(ticker.price).toPrecision(5)}`);
  }

  if (args.test) {
    
    return;
  }
})();
