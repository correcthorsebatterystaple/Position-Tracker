import { BinanceApiService } from './BinanceApiService';

type GetSymbolPriceTickerResponse = { symbol: string; price: string };

export class MarketApiService extends BinanceApiService {
  constructor(apiKey: string) {
    super(apiKey);
  }

  async getSymbolPriceTicker(...symbols: string[]): Promise<GetSymbolPriceTickerResponse[]> {
    const endpoint = '/api/v3/ticker/price';
    const symbolsAgainstUSDT = symbols.map((s) => `${s}USDT`);

    if (symbols.length === 1) {
      return this.get<GetSymbolPriceTickerResponse>(endpoint, { symbol: symbolsAgainstUSDT[0] }).then((res) => [
        res.body,
      ]);
    }
    return this.get<GetSymbolPriceTickerResponse[]>(endpoint).then((res) => {
      if (symbols.length === 0) {
        return res.body;
      }
      return res.body.filter((x) => symbolsAgainstUSDT.includes(x.symbol));
    });
  }
}
