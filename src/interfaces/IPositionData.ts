import { PositionStatus } from "../enums/PositionStatusEnum";

export interface IPositionData {
  id: string;
  date: number;
  ticker: string;
  amount: number;
  opening_price: number;
  status: PositionStatus;
  closing_price?: number;
  parent?: string;
}