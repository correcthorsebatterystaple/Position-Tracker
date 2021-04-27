export interface Position {
  id: string;
  date: number;
  ticker: string;
  amount: number;
  openingPrice: number;
  status: 'OPEN' | 'CLOSED';
  closingPrice?: number;
}

export interface PositionWithComputedData extends Position {
  currentPrice: number;
  openingCost: number;
  currentCost: number;
  gainLossPercentage: number;
  gainLoss: number;
}
