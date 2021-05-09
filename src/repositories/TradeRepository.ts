import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import parseCsv from 'csv-parse/lib/sync';
import { Trade } from '../models/Trade';
export class TradeRepository {
  private filepath: string;
  private trades: Trade[];
  constructor(filepath?: string) {
    this.filepath = filepath ?? path.join(__dirname, '../../trades.csv');
    fs.accessSync(this.filepath, fs.constants.R_OK);

    const csv = fs.readFileSync(this.filepath);
    this.trades = parseCsv(csv, {
      cast: true,
      trim: true,
      columns: true,
    });
  }

  async getAllTrades(): Promise<Trade[]> {
    return this.trades;
  }

  async getTradeById(id: string): Promise<Trade> {
    const trade = this.trades.find((pos) => pos.id === id || pos.id.substring(0, 7) === id);
    if (!trade) {
      throw new Error(`trade not found: ${id}`);
    }

    return trade;
  }

  async addTrade(trade: Omit<Trade, 'id'>): Promise<string> {
    const row = [trade.date, trade.buySymbol, trade.buyAmount, trade.sellSymbol, trade.sellAmount];
    const id = crypto.createHash('sha256').update(row.join(',')).digest('hex');
    row.unshift(id);

    await fs.promises.appendFile(this.filepath, row.join(',').concat('\n'));
    this.trades.push({
      ...trade,
      id: id,
    });

    return id;
  }
}
