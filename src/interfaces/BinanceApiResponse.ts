export interface BinanceApiResponse<T extends Record<string, unknown>> {
  status: number;
  body: T;
}
