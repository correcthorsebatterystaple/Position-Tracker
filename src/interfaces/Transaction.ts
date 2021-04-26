export interface Transaction {
  type: 'Income' | 'Trade';
  buy: number;
  buyCurrency: string;
  fee?: number;
  feeCurrency?: string;
  exchange?: string;
  group?: string;
  comment?: string;
  date: number;
}

export interface IncomeTransaction extends Transaction {
  type: 'Income';
}

export interface TradeTransaction extends Transaction {
  type: 'Trade';
  sell: number;
  sellCurrency: string;
}
