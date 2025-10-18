import request from 'supertest';
import app from '../src/index.js';
import db from '../src/domain/models/index.js';

const { User, Store, Product } = db;

describe('GET /api/products/mine', () => {
  const sellerId = '55555555-5555-5555-5555-555555555555';
  const storeId = '66666666-6666-6666-6666-666666666666';

  beforeAll(async () => {
    await User.create({ id: sellerId, iamId: sellerId, fullName: 'Mine Test Seller', email: 'mine-seller@test.com', password: 'password', role: 'seller' });
    await Store.create({ id: storeId, sellerId, name: 'My Products Store', slug: 'my-products-store' });
    await Product.bulkCreate([
      { name: 'My Product 1', description: 'A product', price: 10, storeId, status: 'active' },
      { name: 'My Product 2', description: 'A product', price: 20, storeId, status: 'active' },
      { name: 'My Product 3', description: 'A product', price: 30, storeId, status: 'paused' },
    ]);
  });

  afterAll(async () => {
    await Product.destroy({ where: { storeId } });
    await Store.destroy({ where: { id: storeId } });
    await User.destroy({ where: { id: sellerId } });
  });

  test('devuelve 200 con productos active y paginación', async () => {
    const res = await request(app)
      .get('/api/products/mine?status=active&page=1&pageSize=20&sort=created_at:desc')
      .set('x-dev-seller-id', sellerId);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every(p => p.status === 'active')).toBe(true);
  });

  test('requiere autenticación dev header', async () => {
    const res = await request(app).get('/api/products/mine');
    expect(res.status).toBe(401);
  });
});
