import { TradeRepository } from '../../src/repositories/TradeRepository';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    appendFile: jest.fn(),
  },
  readFileSync: jest.fn(),
  constants: {},
  accessSync: jest.fn(),
}));
import fs from 'fs';
const mockFs = fs as jest.Mocked<typeof fs>;
const mockFsPromises = fs.promises as jest.Mocked<typeof fs.promises>;

describe('Trade reposiory', () => {
  it('should add trade with correct buy and sell values', async () => {
    mockFs.readFileSync.mockReturnValue(
      'id,date,buySymbol,buyAmount,sellSymbol,sellAmount\n' +
        'bc7c951a5ae8e6feb8f0cfd2d7bfed4f038d33fa82499c6c418fe777e4485a0f,1620527754334,XXX,10,USDT,20'
    );

    const repo = new TradeRepository();
    const trades = repo['trades'];
    const id = await repo.addTrade({
      date: 1000,
      buyAmount: 1,
      buySymbol: 'BBB',
      sellAmount: 2,
      sellSymbol: 'SSS',
    });

    expect(mockFsPromises.appendFile).toBeCalledTimes(1);
    expect(mockFsPromises.appendFile.mock.calls[0][1]).toBe(`${id},1000,BBB,1,SSS,2\n`);
    expect(trades).toHaveLength(2);
    expect(trades[trades.length-1]).toStrictEqual(expect.objectContaining({
      id: id,
      date: 1000,
      buySymbol: 'BBB',
      buyAmount: 1,
      sellSymbol: 'SSS',
      sellAmount: 2
    }));
  });
});
