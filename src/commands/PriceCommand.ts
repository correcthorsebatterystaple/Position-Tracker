import { MarketApiService } from '../services/MarketApiService';
import { ICommand } from '../interfaces/ICommand';

export class PriceCommand implements ICommand {
  name = 'price';
  private symbol: string;

  constructor() {
    // do nothing
  }

  setArguments(args: string[]): void {
    this.symbol = args[0];
  }

  async execute(): Promise<void> {
    const marketApi = new MarketApiService(process.env.API_KEY);
    const [ticker] = await marketApi.getSymbolPriceTicker(this.symbol);

    console.log(`${this.symbol}: ${ticker.price}`);
  }
}
