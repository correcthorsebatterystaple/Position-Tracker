import { Table } from 'console-table-printer';
import { Position, PositionWithComputedData } from '../interfaces/Position';

export class PositionsLogger {
  private openPositions: PositionWithComputedData[];
  constructor(private positions: PositionWithComputedData[]) {
    this.openPositions = positions.filter((pos) => pos.status === 'OPEN');
  }

  logPositions() {
    const table = new Table({
      columns: [
        { name: 'id', title: 'Id' },
        { name: 'date', title: 'Date' },
        { name: 'ticker', title: 'Ticker' },
        { name: 'amount', title: 'Amount' },
        { name: 'openingPrice', title: 'Opening Price' },
        { name: 'currentPrice', title: 'Current Price' },
        { name: 'openingCost', title: 'Opening Cost' },
        { name: 'currentCost', title: 'Current Cost' },
        { name: 'gainLoss', title: 'Gain/Loss' },
      ],
      sort: (a, b) => (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0),
    });
    this.openPositions.forEach((p) => {
      const display = {
        id: p.id.substring(0, 7).concat('...'),
        date: new Date(p.date).toLocaleString(),
        ticker: p.ticker,
        amount: p.amount.toPrecision(5),
        openingPrice: p.openingPrice.toPrecision(5),
        currentPrice: p.currentPrice.toPrecision(5),
        openingCost: p.openingCost.toPrecision(5),
        currentCost: p.currentCost.toPrecision(5),
        gainLoss: p.gainLoss.toPrecision(5),
      };
      table.addRow(display, { color: p.gainLoss >= 0 ? 'green' : 'red' });
    });

    table.printTable();
  }

  logCumulative() {
    const openingTotalCost = this.openPositions.reduce((acc, pos) => acc + pos.openingCost, 0);
    const currentTotalCost = this.openPositions.reduce((acc, pos) => acc + pos.currentCost, 0);
    const gainLoss = (currentTotalCost / openingTotalCost - 1) * 100;

    const table = new Table();
    table.addRow(
      {
        'Cum. Opening Total': openingTotalCost.toPrecision(5),
        'Cum. Current Total': currentTotalCost.toPrecision(5),
        'Gain/Loss': gainLoss.toPrecision(3),
      },
      { color: gainLoss >= 0 ? 'green' : 'red' }
    );

    table.printTable();
  }

  logAvgCostPerCurreny() {
    const totalCostByTicker = this.openPositions.reduce((acc, pos) => {
      acc[pos.ticker] = (acc[pos.ticker] ?? 0) + pos.openingCost;
      return acc;
    }, {});
    const totalAmountByTicker = this.openPositions.reduce((acc, pos) => {
      acc[pos.ticker] = (acc[pos.ticker] ?? 0) + pos.amount;
      return acc;
    }, {});

    const rows = Object.keys(totalCostByTicker).map((ticker) => {
      const avgPrice = totalCostByTicker[ticker] / totalAmountByTicker[ticker];
      const currentPrice =
        this.openPositions.find((pos) => pos.ticker === ticker).currentPrice;
      return {
        ticker: ticker,
        avgCost: (avgPrice * totalAmountByTicker[ticker]).toPrecision(5),
        currentCost: (currentPrice * totalAmountByTicker[ticker]).toPrecision(5),
        avgPrice: avgPrice.toPrecision(5),
        currentPrice: currentPrice.toPrecision(5),
        gainLoss: ((currentPrice / avgPrice - 1) * 100).toPrecision(3),
      };
    });

    const table = new Table({
      columns: [
        { name: 'ticker', title: 'Ticker' },
        { name: 'avgCost', title: 'Avg. Cost' },
        { name: 'currentCost', title: 'Current Cost' },
        { name: 'avgPrice', title: 'Avg. Price' },
        { name: 'currentPrice', title: 'Current Price' },
        { name: 'gainLoss', title: 'Gain/Loss' },
      ],
    });
    rows.forEach((row) => {
      table.addRow(row, { color: parseFloat(row.gainLoss) >= 0 ? 'green' : 'red' });
    });
    table.printTable();
  }
}
