import { PositionRepository } from '../../src/repositories/PositionRepository';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    appendFile: jest.fn(),
  },
  readFileSync: jest.fn(),
}));
import fs from 'fs';
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Position Repository', () => {
  it('should parse all positions from csv');
  it('should return all positions from file');
  it('should insert position to file and to internal store');
  it('should throw error when updating with unknown id');
  it('should throw error when fetching with unknown id');
  it('should get position by id');
});
