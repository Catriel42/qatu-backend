import ProductRepository from '../src/application/repositories/ProductRepository.js';
import { sequelize } from '../src/infrastructure/database/index.js';

describe('ProductRepository.listBySeller', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  it('lista productos ACTIVE del seller', async () => {
    const sellerId = '11111111-1111-1111-1111-111111111111';
    const { rows, count } = await ProductRepository.listBySeller(sellerId, {
      status: 'active',
      page: 1,
      pageSize: 50,
    });
    expect(count).toBeGreaterThanOrEqual(2);
    expect(rows.every(p => p.status === 'active')).toBe(true);
    expect(rows.every(p => p.store && p.store.id)).toBe(true);
  });

  it('filtra por q (ilike name)', async () => {
    const sellerId = '11111111-1111-1111-1111-111111111111';
    const { rows, count } = await ProductRepository.listBySeller(sellerId, {
      status: 'active',
      q: 'iphone',
    });
    expect(count).toBeGreaterThanOrEqual(1);
    expect(rows.some(p => /iphone/i.test(p.name))).toBe(true);
  });

  it('ordena por price asc', async () => {
    const sellerId = '11111111-1111-1111-1111-111111111111';
    const { rows } = await ProductRepository.listBySeller(sellerId, {
      status: 'active',
      sort: 'price:asc',
    });
    const prices = rows.map(r => Number(r.price));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });
});
