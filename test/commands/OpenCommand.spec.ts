import { OpenCommand } from '../../src/commands/OpenCommand';
import { PositionStatus } from '../../src/enums/PositionStatusEnum';

jest.mock('../../src/repositories/PositionRepository');
import { PositionRepository } from '../../src/repositories/PositionRepository';
const mockPositionRepository = PositionRepository as jest.MockedClass<typeof PositionRepository>;

describe('Open Command', () => {
  beforeEach(() => {
    mockPositionRepository.mockReset();
  });

  it('should throw error if no ticker given', async () => {
    const command = new OpenCommand();
    const args = ['--price', '100', '--amount', '100'];

    expect(() => command.setArguments(args)).toThrowError(Error);
  });

  it('should throw error if no price given', async () => {
    const command = new OpenCommand();
    const args = ['--ticker', 'XYZ', '--amount', '100'];

    expect(() => command.setArguments(args)).toThrowError(Error);
  });

  it('should throw error if no amount given', async () => {
    const command = new OpenCommand();
    const args = ['--ticker', 'XYZ', '--price', '100'];

    expect(() => command.setArguments(args)).toThrowError(Error);
  });

  it('should make a single call to position repo insert if params are valid', () => {
    const command = new OpenCommand();
    const args = ['--ticker', 'XYZ', '--price', '100', '--amount', '100'];

    expect(mockPositionRepository).toBeCalledTimes(1);

    command.setArguments(args);
    command.execute();

    expect(mockPositionRepository.prototype.insertPosition).toBeCalledTimes(1);
    expect(mockPositionRepository.prototype.insertPosition).toBeCalledWith(
      expect.objectContaining({
        date: expect.any(Number),
        ticker: 'XYZ',
        amount: 100,
        opening_price: 100,
        status: PositionStatus.OPEN,
      })
    );
  });
});
