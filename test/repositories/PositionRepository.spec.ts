import { PositionRepository } from '../../src/repositories/PositionRepository';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    appendFile: jest.fn(),
  },
  readFileSync: jest.fn(),
}));
import fs from 'fs';
import { PositionStatus } from '../../src/enums/PositionStatusEnum';
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Position Repository', () => {
  it('should parse all positions from csv', async () => {
    mockFs.readFileSync = jest
      .fn()
      .mockReturnValueOnce(
        'id,date,ticker,amount,opening_price,status,closing_price,parent\n' +
          'uniqueId1,1000,XYZ,1,1,OPEN,,\n' +
          'uniqueId2,1000,ABC,1,1,CLOSED,10,\n'
      );

    const repo = new PositionRepository();
    const positions = await repo.getAllPositions();

    expect(positions).toHaveLength(2);
    expect(positions).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'uniqueId1',
          ticker: 'XYZ',
          date: 1000,
          amount: 1,
          openingPrice: 1,
          status: 'OPEN',
        }),
        expect.objectContaining({
          id: 'uniqueId2',
          ticker: 'ABC',
          date: 1000,
          amount: 1,
          openingPrice: 1,
          status: 'CLOSED',
          closingPrice: 10,
        }),
      ])
    );
  });

  it('should insert position to file and to internal store', async () => {
    mockFs.promises.appendFile = jest.fn();
    mockFs.readFileSync = jest
      .fn()
      .mockReturnValueOnce(
        'id,date,ticker,amount,opening_price,status,closing_price,parent\n' +
          'uniqueId1,1000,XYZ,1,1,OPEN,,\n' +
          'uniqueId2,1000,ABC,1,1,CLOSED,10,\n'
      );

    const repo = new PositionRepository();
    const id = await repo.insertPosition({
      date: 1500,
      amount: 2,
      opening_price: 2,
      status: PositionStatus.OPEN,
      ticker: 'PQR',
    });

    const positions = await repo.getAllPositions();

    expect(positions).toHaveLength(3);
    expect(positions).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'uniqueId1',
          ticker: 'XYZ',
          date: 1000,
          amount: 1,
          openingPrice: 1,
          status: 'OPEN',
        }),
        expect.objectContaining({
          id: 'uniqueId2',
          ticker: 'ABC',
          date: 1000,
          amount: 1,
          openingPrice: 1,
          status: 'CLOSED',
          closingPrice: 10,
        }),
        expect.objectContaining({
          id: id,
          ticker: 'PQR',
          date: 1500,
          amount: 2,
          openingPrice: 2,
          status: 'OPEN',
        }),
      ])
    );
  });

  it('should throw error when updating with unknown id', async () => {
    mockFs.promises.appendFile = jest.fn();
    mockFs.readFileSync = jest
      .fn()
      .mockReturnValueOnce(
        'id,date,ticker,amount,opening_price,status,closing_price,parent\n' +
          'uniqueId1,1000,XYZ,1,1,OPEN,,\n' +
          'uniqueId2,1000,ABC,1,1,CLOSED,10,\n'
      );

    const repo = new PositionRepository();
    const updatePromise = repo.updatePosition('notFoundId', {
      status: PositionStatus.CLOSED,
    });

    expect(updatePromise).rejects.not.toBeNull();
    expect(mockFs.promises.writeFile).not.toBeCalled();
  });

  it('should throw error when fetching with unknown id', () => {
    mockFs.readFileSync = jest
      .fn()
      .mockReturnValueOnce(
        'id,date,ticker,amount,opening_price,status,closing_price,parent\n' +
          'uniqueId1,1000,XYZ,1,1,OPEN,,\n' +
          'uniqueId2,1000,ABC,1,1,CLOSED,10,\n'
      );
    const repo = new PositionRepository();
    const getPromise = repo.getPositionById('notFoundId');

    expect(getPromise).rejects.not.toBeNull();
  });

  it('should get position by id', async () => {
    mockFs.readFileSync = jest
      .fn()
      .mockReturnValueOnce(
        'id,date,ticker,amount,opening_price,status,closing_price,parent\n' +
          'uniqueId1,1000,XYZ,1,1,OPEN,,\n' +
          'uniqueId2,1000,ABC,1,1,CLOSED,10,\n'
      );
    const repo = new PositionRepository();
    const pos = await repo.getPositionById('uniqueId1');

    expect(pos).toStrictEqual(
      expect.objectContaining({
        id: 'uniqueId1',
        ticker: 'XYZ',
        date: 1000,
        amount: 1,
        openingPrice: 1,
        status: 'OPEN',
      })
    );
  });

  it('should update position if params are valid', async () => {
    mockFs.readFileSync = jest
      .fn()
      .mockReturnValueOnce(
        'id,date,ticker,amount,opening_price,status,closing_price,parent\n' +
          'uniqueId1,1000,XYZ,1,1,OPEN,,\n' +
          'uniqueId2,1000,ABC,1,1,CLOSED,10,\n'
      );
    mockFs.promises.writeFile = jest.fn();
    const repo = new PositionRepository();
    const update = await repo.updatePosition('uniqueId1', {
      date: 5000,
      ticker: 'XXX',
      amount: 7,
      opening_price: 7,
      closing_price: 7,
      parent: 'table',
      status: PositionStatus.CLOSED,
    });
    const positions = await repo.getAllPositions();
    const updatedPosition = positions.find(p => p.id === 'uniqueId1');

    expect(positions).toHaveLength(2);
    expect(updatedPosition).toStrictEqual(expect.objectContaining({
      id: 'uniqueId1',
      date: 5000,
      ticker: 'XXX',
      amount: 7,
      openingPrice: 7,
      closingPrice: 7,
      parent: 'table',
      status: PositionStatus.CLOSED,
    }));
    expect(mockFs.promises.writeFile).toBeCalled();
  });
});
