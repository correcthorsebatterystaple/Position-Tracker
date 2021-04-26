import parseCsv from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import { IncomeTransaction, TradeTransaction, Transaction } from '../interfaces/Transaction';

export function populateTransactions(csvPath: string) {
  const csv = fs.readFileSync(csvPath)
  const data: {[key:string]: any}[] = parseCsv(csv, {
    cast: true,
    castDate: true,
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

  const transactions = data.map(d => {
    return {...d, date: d.date.valueOf()}
  });
  fs.writeFileSync(path.join(__dirname, '../transactions.json'), JSON.stringify(transactions));
}
