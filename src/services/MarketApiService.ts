import { BinanceApiService } from './BinanceApiService';

export class MarketApiService extends BinanceApiService {
  constructor(apiKey: string) {
    super(apiKey);
  }

  async getSymbolPriceTicker(): Promise<any[]> {
    const endpoint = '/api/v3/ticker/price';
    return await this.get(endpoint).then(res => res.body);
  }
}
