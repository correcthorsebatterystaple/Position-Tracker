import { Table } from 'console-table-printer';
import { PositionStatus } from '../enums/PositionStatusEnum';
import { PositionWithComputedData } from '../interfaces/Position';
import 'colors';

export class PositionsLogger {
  private openPositions: PositionWithComputedData[];
  constructor(positions: PositionWithComputedData[]) {
    this.openPositions = positions.sort((a, b) => a.date - b.date).filter((pos) => pos.status === PositionStatus.OPEN);
  }

  logPositions(): void {
    const table = new Table({
      columns: [
        { name: 'id', title: 'Id' },
        { name: 'date', title: 'Date' },
        { name: 'ticker', title: 'Ticker' },
        { name: 'amount', title: 'Amount' },
        { name: 'gainLoss', title: 'Gain/Loss $' },
        { name: 'gainLossPercentage', title: 'Gain/Loss %' },
        { name: 'openingPrice', title: 'Opening Price' },
        { name: 'currentPrice', title: 'Current Price' },
        { name: 'openingCost', title: 'Opening Cost' },
        { name: 'currentCost', title: 'Current Cost' },
      ],
    });
    const rows = this.openPositions
      .map((p) => {
        const display = {
          id: p.id.substring(0, 7).concat('...'),
          date: new Date(p.date).toLocaleString(),
          ticker: p.ticker,
          amount: p.amount.toPrecision(5),
          openingPrice: p.openingPrice.toPrecision(5),
          currentPrice: p.currentPrice.toPrecision(5),
          openingCost: p.openingCost.toPrecision(5),
          currentCost: p.currentCost.toPrecision(5),
          gainLoss: p.gainLoss.toFixed(2),
          gainLossPercentage: p.gainLossPercentage.toFixed(2),
        };
        const colour = p.status === PositionStatus.CLOSED ? 'grey' : p.gainLossPercentage >= 0 ? 'green' : 'red';
        Object.keys(display).forEach((key) => (display[key] = display[key][colour]));
        return display;
      });

    rows.forEach((row) => table.addRow(row));
    table.printTable();
  }

  logCumulative(): void {
    const openingTotalCost = this.openPositions.reduce((acc, pos) => acc + pos.openingCost, 0);
    const currentTotalCost = this.openPositions.reduce((acc, pos) => acc + pos.currentCost, 0);
    const gainLossPercent = (currentTotalCost / openingTotalCost - 1) * 100;

    const table = new Table();
    table.addRow(
      {
        'Opening Cost Total': openingTotalCost.toPrecision(5),
        'Current Cost Total': currentTotalCost.toPrecision(5),
        'Gain/Loss $': (currentTotalCost - openingTotalCost).toFixed(2),
        'Gain/Loss %': gainLossPercent.toPrecision(3),
      },
      { color: gainLossPercent >= 0 ? 'green' : 'red' }
    );

    table.printTable();
  }

  logAvgCostPerCurreny(): void {
    const totalOpeningCostByTicker = this.openPositions.reduce((acc, pos) => {
      acc[pos.ticker] = (acc[pos.ticker] ?? 0) + pos.openingCost;
      return acc;
    }, {});
    const totalAmountByTicker = this.openPositions.reduce((acc, pos) => {
      acc[pos.ticker] = (acc[pos.ticker] ?? 0) + pos.amount;
      return acc;
    }, {});

    const rows = Object.keys(totalOpeningCostByTicker).map((ticker) => {
      const avgPrice = totalOpeningCostByTicker[ticker] / totalAmountByTicker[ticker];
      const currentPrice = this.openPositions.find((pos) => pos.ticker === ticker).currentPrice;
      const currentCost = currentPrice * totalAmountByTicker[ticker];
      return {
        ticker: ticker,
        amount: totalAmountByTicker[ticker].toPrecision(5),
        avgCost: (avgPrice * totalAmountByTicker[ticker]).toPrecision(5),
        currentCost: currentCost.toPrecision(5),
        avgPrice: avgPrice.toPrecision(5),
        currentPrice: currentPrice.toPrecision(5),
        gainLossPercent: ((currentPrice / avgPrice - 1) * 100).toPrecision(3),
        gainLoss: (currentCost - totalOpeningCostByTicker[ticker]).toFixed(2),
      };
    });

    const table = new Table({
      columns: [
        { name: 'ticker', title: 'Ticker' },
        { name: 'amount', title: 'Amount' },
        { name: 'gainLoss', title: 'Gain/Loss $' },
        { name: 'gainLossPercent', title: 'Gain/Loss %' },
        { name: 'avgCost', title: 'Avg. Cost' },
        { name: 'currentCost', title: 'Current Cost' },
        { name: 'avgPrice', title: 'Avg. Price' },
        { name: 'currentPrice', title: 'Current Price' },
      ],
    });
    rows.forEach((row) => {
      table.addRow(row, { color: parseFloat(row.gainLoss) >= 0 ? 'green' : 'red' });
    });
    table.printTable();
  }
}
