jest.mock('../../src/repositories/TradeRepository.ts');
import { SellCommand } from '../../src/commands/SellCommand';
import { TradeRepository } from '../../src/repositories/TradeRepository';

const mockTradeRepository = TradeRepository as jest.MockedClass<typeof TradeRepository>;

describe('Buy command', () => {
  it('should add a buy trade for the symbol at the cost', async () => {
    jest.spyOn(Date, 'now').mockReturnValueOnce(1000);

    const cmd = new SellCommand();
    cmd.setArguments('--symbol XXX --cost 10 --amount 5'.split(' '));
    await cmd.execute();

    expect(mockTradeRepository.prototype.addTrade).toBeCalledTimes(1);
    expect(mockTradeRepository.prototype.addTrade).toBeCalledWith({
      date: 1000,
      sellAmount: 5,
      sellSymbol: 'XXX',
      buySymbol: 'USDT',
      buyAmount: 10,
    });
  });
});
