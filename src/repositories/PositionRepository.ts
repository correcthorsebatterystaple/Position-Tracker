import { IPositionData } from '../interfaces/IPositionData';
import path from 'path';
import fs from 'fs';
import parseCsv from 'csv-parse/lib/sync';
import { Position } from '../interfaces/Position';
import crypto from 'crypto';

export class PositionRepository {
  private positions: IPositionData[];
  private filePath: string;

  constructor(filename: string = 'positions.csv') {
    const rootDir = path.dirname(require.main.filename);
    this.filePath = path.join(rootDir, filename);
    const csv = fs.readFileSync(this.filePath);
    this.positions = parseCsv(csv, {
      cast: true,
      trim: true,
      columns: true,
    });
  }

  async getAllPositions(): Promise<Position[]> {
    return this.positions.map(pos => this.mapPositionDataToPosition(pos));
  }

  async getPositionById(id: string): Promise<Position> {
    const position = this.positions.find((pos) => pos.id === id || pos.id.substring(0, 7) === id);
    if (!position) {
      throw new Error(`Position not found: ${id}`);
    }

    return this.mapPositionDataToPosition(position);
  }

  async insertPosition(position: Omit<IPositionData, 'id'>): Promise<string> {
    const row = [
      position.date,
      position.ticker,
      position.amount,
      position.opening_price,
      position.status,
      position.closing_price,
    ];
    const rowCsv = row.join(',');

    const id = crypto.createHash('sha256').update(rowCsv).digest('hex');

    row.unshift(id);

    await fs.promises.appendFile(this.filePath, row.join(',').concat('\n'));

    return id;
  }

  async updatePosition(id: string, position: Partial<Omit<IPositionData, 'id'>>) {
    const positionToUpdate = this.positions.find((pos) => pos.id === id || pos.id.substring(0, 7) === id);
    if (!positionToUpdate) {
      throw new Error(`Position not found: ${id}`);
    }

    positionToUpdate.status ??= position.status;
    positionToUpdate.closing_price ??= position.closing_price;

    const csvPositions = this.positions
      .map((pos) =>
        [pos.id, pos.date, pos.ticker, pos.amount, pos.opening_price, pos.status, pos.closing_price ?? ''].join(',')
      )
      .join('\n')
      .concat('\n');

    const csvHeaders = 'id,date,ticker,amount,opening_price,status,closing_price';

    await fs.promises.writeFile(this.filePath, csvHeaders);
    await fs.promises.appendFile(this.filePath, csvPositions)

    return positionToUpdate;
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
