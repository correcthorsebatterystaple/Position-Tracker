export interface BinanceApiResponse<T extends {}> {
  status: number,
  body: T
}