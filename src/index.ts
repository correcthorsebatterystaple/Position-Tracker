require('dotenv').config();
import { populateTransactions } from "./scripts/populateTransactions";
import { MarketApiService } from "./services/MarketApiService";
import path from 'path';
import { Transaction } from "./interfaces/Transaction";


(async function main() {
  const _args = require('minimist')(process.argv.slice(2));

  const args = {
    populate: _args._[0] === 'populate',
    show: _args._[0] === 'show', 
  };

  if (args.populate) {
    populateTransactions(path.join(__dirname, '../history.csv'));
    return;
  }

  if (args.show) {
    const marketApi = new MarketApiService(process.env.API_KEY);
    const ticker = await marketApi.getSymbolPriceTicker();

    const transactions: Transaction[] = require(path.join(__dirname, './transactions.json'));

    
  }
})();