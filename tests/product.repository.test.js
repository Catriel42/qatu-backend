import ProductRepository from '../src/application/repositories/ProductRepository.js';
import { sequelize } from '../src/infrastructure/database/index.js';
import db from '../src/domain/models/index.js';

const { User, Store, Product } = db;

describe('ProductRepository.listBySeller', () => {
  const sellerId = '11111111-1111-1111-1111-111111111111';
  const storeId = '22222222-2222-2222-2222-222222222222';

  beforeAll(async () => {
    await User.create({ id: sellerId, iamId: sellerId, fullName: 'Test Seller', email: 'seller@test.com', password: 'password', role: 'seller' });
    await Store.create({ id: storeId, sellerId, name: 'Test Store', slug: 'test-store' });
    await Product.bulkCreate([
      { name: 'iPhone 13', description: 'An iPhone', price: 1000, storeId, status: 'active' },
      { name: 'iPhone 14', description: 'An iPhone', price: 1200, storeId, status: 'active' },
      { name: 'Samsung Galaxy', description: 'A Samsung phone', price: 900, storeId, status: 'active' },
      { name: 'iPhone 15', description: 'An iPhone', price: 1500, storeId, status: 'paused' },
    ]);
  });

  afterAll(async () => {
    await Product.destroy({ where: { storeId } });
    await Store.destroy({ where: { id: storeId } });
    await User.destroy({ where: { id: sellerId } });
  });

  it('lista productos ACTIVE del seller', async () => {
    const { rows, count } = await ProductRepository.listBySeller(sellerId, {
      status: 'active',
      page: 1,
      pageSize: 50,
    });
    expect(count).toBe(3);
    expect(rows.every(p => p.status === 'active')).toBe(true);
  });

  it('filtra por q (ilike name)', async () => {
    const { rows, count } = await ProductRepository.listBySeller(sellerId, {
      status: 'active',
      q: 'iphone',
    });
    expect(count).toBe(2);
    expect(rows.every(p => /iphone/i.test(p.name))).toBe(true);
  });

  it('ordena por price asc', async () => {
    const { rows } = await ProductRepository.listBySeller(sellerId, {
      status: 'active',
      sort: 'price:asc',
    });
    const prices = rows.map(r => Number(r.price));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });
});
