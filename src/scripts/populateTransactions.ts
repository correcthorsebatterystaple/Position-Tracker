import parseCsv from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import { IncomeTransaction, TradeTransaction, Transaction } from '../interfaces/Transaction';

export function populateTransactions(csvPath: string) {
  const csv = fs.readFileSync(csvPath)
  const data: Transaction[] = parseCsv(csv, {
    cast: true,
    columns: [
      'type',
      'buy',
      'buyCurrency',
      'sell',
      'sellCurrency',
      'fee',
      'feeCurrency',
      'exchange',
      'group',
      'comment',
      'date',
    ],
    from: 2,
    ltrim: true,
    rtrim: true,
  });


  fs.writeFileSync(path.join(__dirname, '../transactions.json'), JSON.stringify(data));
}
