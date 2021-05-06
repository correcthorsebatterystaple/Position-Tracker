import { BinanceApiService } from './BinanceApiService';
import * as crypto from 'crypto';

export class WalletApiService extends BinanceApiService {
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

  async getAllCoinsInformation(): Promise<{ symbol: string; price: string }[]> {
    const endpoint = '/sapi/v1/capital/config/getall';
    const params = this.getSignedParameters({ timestamp: Date.now().toString() });
    return this.get<{ symbol: string; price: string }[]>(endpoint, params).then((res) => res.body);
  }

  async getDepositHistory(): Promise<unknown> {
    const endpoint = '/wapi/v3/depositHistory.html';
    const params = this.getSignedParameters({ timestamp: Date.now().toString() });
    return this.get(endpoint, params).then((res) => res.body);
  }
}
