import fetch from 'node-fetch';
import { BinanceApiResponse } from '../interfaces/BinanceApiResponse';

export class BinanceApiService {
  private readonly API_KEY_HEADER = 'X-MBX-APIKEY';
  private readonly BASE_URL = 'https://api.binance.com';
  private authHeaders: { [key: string]: string };
  private cooldown = 0;

  constructor(private apiKey: string) {
    this.authHeaders = {};
    this.authHeaders[this.API_KEY_HEADER] = apiKey;
  }

  protected async get<T>(
    endpoint: string,
    queryParams: { [key: string]: string | number } = {},
    headers: { [key: string]: string } = {}
  ): Promise<BinanceApiResponse<T>> {
    if (this.cooldown >= Date.now()) {
      return undefined;
    }
    const encodedQueryParams = '?'.concat(
      Object.keys(queryParams)
        .map((key) => `${key}=${queryParams[key]}`)
        .join('&')
    );
    return fetch(this.BASE_URL + endpoint + encodedQueryParams, {
      headers: {
        ...this.authHeaders,
        ...headers,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${res.status} GET ${endpoint}`);
        }
        return res;
      })
      .then(async (res) => {
        return {
          status: res.status,
          body: await res.json(),
        };
      });
  }
}
