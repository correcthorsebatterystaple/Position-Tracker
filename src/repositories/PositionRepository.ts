import { IPositionData } from '../interfaces/IPositionData';
import path from 'path';
import fs from 'fs';
import parseCsv from 'csv-parse/lib/sync';
import { Position } from '../interfaces/Position';
import crypto from 'crypto';

export class PositionRepository {
  private positions: IPositionData[];
  private filePath: string;

  constructor(filename = 'positions.csv') {
    const rootDir = path.dirname(require.main.filename);
    this.filePath = path.join(rootDir, filename);
    const csv = fs.readFileSync(this.filePath);
    this.positions = parseCsv(csv, {
      cast: true,
      trim: true,
      columns: true,
    });
  }

  async getAllPositions(map?: true): Promise<Position[]>;
  async getAllPositions(map?: false): Promise<IPositionData[]>;
  async getAllPositions(map = true): Promise<(Position | IPositionData)[]> {
    return map ? this.positions.map((pos) => this.mapPositionDataToPosition(pos)) : this.positions;
  }

  async getPositionById(id: string, map?: true): Promise<Position>;
  async getPositionById(id: string, map?: false): Promise<IPositionData>;
  async getPositionById(id: string, map = true): Promise<Position | IPositionData> {
    const position = this.positions.find((pos) => pos.id === id || pos.id.substring(0, 7) === id);
    if (!position) {
      throw new Error(`Position not found: ${id}`);
    }

    return map ? this.mapPositionDataToPosition(position) : position;
  }

  async insertPosition(position: Omit<IPositionData, 'id'>): Promise<string> {
    const row = [
      position.date,
      position.ticker,
      position.amount,
      position.opening_price,
      position.status,
      position.closing_price,
      position.parent,
    ];
    const rowCsv = row.join(',');

    const id = crypto.createHash('sha256').update(rowCsv).digest('hex');

    row.unshift(id);

    await fs.promises.appendFile(this.filePath, row.join(',').concat('\n'));

    this.positions.push({
      ...position,
      id: id,
    });

    return id;
  }

  async updatePosition(id: string, position: Partial<Omit<IPositionData, 'id'>>): Promise<IPositionData> {
    const positionToUpdate = this.positions.find((pos) => pos.id === id || pos.id.substring(0, 7) === id);
    if (!positionToUpdate) {
      throw new Error(`Position not found: ${id}`);
    }

    positionToUpdate.status = position.status ?? positionToUpdate.status;
    positionToUpdate.closing_price = position.closing_price ?? positionToUpdate.closing_price;
    positionToUpdate.amount = position.amount ?? positionToUpdate.amount;

    const csvPositions = this.positions
      .map((pos) =>
        [pos.id, pos.date, pos.ticker, pos.amount, pos.opening_price, pos.status, pos.closing_price, pos.parent].join(
          ','
        )
      )
      .join('\n')
      .concat('\n');

    const csvHeaders = 'id,date,ticker,amount,opening_price,status,closing_price,parent\n';

    await fs.promises.writeFile(this.filePath, csvHeaders);
    await fs.promises.appendFile(this.filePath, csvPositions);

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
