import * as queueService from '../src/services/queueService';
import pool from '../src/db';

jest.mock('../src/db', () => {
  const mClient = {
    query: jest.fn()
  };
  return {
    __esModule: true,
    default: {
      query: mClient.query,
      connect: jest.fn().mockResolvedValue({
        query: mClient.query,
        release: jest.fn()
      })
    }
  };
});

describe('queueService', () => {
  it('createTurn calls db', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: '1', patient_name: 'Ana', specialty: 'Pediatría', scheduled_at: null, consult_room: null, created_at: new Date().toISOString(), status: 'waiting' }] });
    const r = await queueService.createTurn('Ana', 'Pediatría');
    expect(r.patient_name).toBe('Ana');
  });
});
