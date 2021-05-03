import { IPositionData } from './IPositionData';
import path from 'path';
import fs from 'fs';
import parseCsv from 'csv-parse/lib/sync';
import { Position } from '../interfaces/Position';

export class PositionRepository {
  private positions: IPositionData[];
  private filePath: string;

  private constructor(filename: string = 'positions.csv') {
    const rootDir = path.dirname(require.main.filename);
    this.filePath = path.join(rootDir, filename);
    const csv = fs.readFileSync(this.filePath);
    this.positions = parseCsv(csv, {
      cast: true,
      trim: true,
      fromLine: 2,
    });
  }

  getPositionById(id: string): Position {
    const position = this.positions.find((pos) => pos.id === id || pos.id.substring(0, 7) === id);
    if (!position) {
      throw new Error(`Position not found: ${id}`);
    }

    return this.mapPositionDataToPosition(position);
  }

  private mapPositionDataToPosition(data: IPositionData): Position {
    return {
      id: data.id,
      amount: data.amount,
      date: data.date,
      openingPrice: data.opening_price,
      status: data.status,
      ticker: data.ticker,
      closingPrice: data.closing_price,
    };
  }
}
