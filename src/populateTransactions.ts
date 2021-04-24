import parseCsv from 'csv-parse/lib/sync';
import fs from 'fs';

const data: any[] = require('./transactions.json') || [];

const areEqualShallow = (a: {}, b: {}): boolean => {
  for (var key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }
  for (var key in b) {
    if (!(key in a) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

const cashDepositCsv = fs.readFileSync('./cash-deposit-history.csv');
const cashDepositData: any[] = parseCsv(cashDepositCsv, {
  autoParse: true,
  columns: ['date', 'coin', 'amount', 'status', 'paymentMethod', 'indicatedAmount', 'fee', 'orderId'],
});

cashDepositData.forEach((datum) => (datum.dataType = 'CASH_DEPOSIT'));
const newCashDepositData = cashDepositData.filter(
  (datum) => !data.find((rec) => rec.dataType === 'CASH_DEPOSIT' && rec.orderId === datum.orderId)
);
data.push(...newCashDepositData);

const cryptoBuyCsv = fs.readFileSync('./crypto-buy-history.csv');
const cryptoBuyData = parseCsv(cryptoBuyCsv, {
  autoParse: true,
  columns: ['date', 'method', 'amount', 'price', 'fees', 'finalAmount', 'status', 'transactionId'],
});

cryptoBuyData.forEach((datum) => (datum.dataType = 'CRYPTO_BUY'));
const newCryptoBuyData = cryptoBuyData.filter(
  (datum) => !data.find((rec) => rec.dataType === 'CRYPTO_BUY' && rec.transactionId === datum.transactionId)
);
data.push(...newCryptoBuyData);

const tradeCsv = fs.readFileSync('./trade-history.csv');
const tradeData = parseCsv(tradeCsv, {
  autoParse: true,
  columns: ['date', 'market', 'type', 'price', 'amount', 'total', 'fee', 'feeCoin'],
});

tradeData.forEach((datum) => (datum.dataType = 'TRADE'));
const newtradeData = tradeData.filter((datum) => !data.some((rec) => areEqualShallow(rec, datum)));
data.push(...newtradeData);

fs.writeFileSync('./transactions.json', JSON.stringify(data, null, 2));
