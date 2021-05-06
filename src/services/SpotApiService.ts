import { BinanceApiService } from './BinanceApiService';
import * as crypto from 'crypto';

export class SpotApiService extends BinanceApiService {
  constructor(apiKey: string, private secretKey: string) {
    super(apiKey);
  }

  private getSignedParameters(parameters: { [key: string]: string }): { [key: string]: string } {
    const encodedParams = Object.keys(parameters)
      .map((key) => `${key}=${parameters[key]}`)
      .join('&');

    const sign = crypto.createHmac('sha256', this.secretKey).update(encodedParams).digest('hex');

    return {
      ...parameters,
      signature: sign,
    };
  }

  async getAllOrders(symbol: string): Promise<unknown> {
    const endpoint = '/api/v3/allOrders';
    const params = this.getSignedParameters({
      symbol: symbol,
      timestamp: Date.now().toString(),
    });

    return this.get(endpoint, params).then((res) => res.body);
  }
}
