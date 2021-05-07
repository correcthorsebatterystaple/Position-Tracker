import { CloseCommand } from '../../src/commands/CloseCommand';

jest.mock('../../src/repositories/PositionRepository');
import { PositionRepository } from '../../src/repositories/PositionRepository';
const mockPositionRepository = PositionRepository as jest.MockedClass<typeof PositionRepository>;

describe('Close Command', () => {
  it('should throw error if id is missing');
  it('should throw error if price is missing');
  it('should throw error if id does not exist');
});

describe('Partial Close Command', () => {
  it('should throw error if id is missing');
  it('should throw error if price is missing');
  it('should throw error if amount is missing');
  it('should throw error if id does not exist');
});
