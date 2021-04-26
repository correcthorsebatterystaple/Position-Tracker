import parseCsv from 'csv-parse/lib/sync'

const x = parseCsv('./history.csv', {
  // columns: [
  //   'type',
  //   'buy',
  //   'buyCurrency',
  //   'sell',
  //   'sellCurrency',
  //   'fee',
  //   'feeCurrency',
  //   'exchange',
  //   'group',
  //   'comment',
  //   'date',
  // ],
  from: 2,
  ltrim: true,
  rtrim: true,
});

console.log(x);