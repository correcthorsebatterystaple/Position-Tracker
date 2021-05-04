export interface ICloseCommandArgs {
  id: string;
  price: number;
  partial: boolean;
  amount?: number;
}