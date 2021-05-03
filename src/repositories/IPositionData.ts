export interface IPositionData {
  id: string;
  date: number;
  ticker: string;
  amount: number;
  opening_price: number;
  status: 'OPEN' | 'CLOSED';
  closing_price?: number;
}