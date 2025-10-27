import request from 'supertest';
import app from '../src/index.js';
import db from '../src/domain/models/index.js';

const { User, Store, Product } = db;

describe('Product API', () => {
  const sellerId1 = '11111111-1111-1111-1111-111111111111';
  const storeId1 = '22222222-2222-2222-2222-222222222222';
  const sellerId2 = '33333333-3333-3333-3333-333333333333';
  const storeId2 = '44444444-4444-4444-4444-444444444444';
  let product1;

  beforeEach(async () => {
    await User.bulkCreate([
      { id: sellerId1, iamId: sellerId1, fullName: 'Test Seller 1', email: 'seller1@test.com', password: 'password', role: 'seller' },
      { id: sellerId2, iamId: sellerId2, fullName: 'Test Seller 2', email: 'seller2@test.com', password: 'password', role: 'seller' },
    ]);
    await Store.bulkCreate([
      { id: storeId1, sellerId: sellerId1, name: 'Store 1', slug: 'store-1' },
      { id: storeId2, sellerId: sellerId2, name: 'Store 2', slug: 'store-2' },
    ]);
    product1 = await Product.create({ name: 'Product 1', description: 'A product', price: 10, storeId: storeId1, status: 'active' });
    await Product.bulkCreate([
        { name: 'Product 2', description: 'A product', price: 20, storeId: storeId1, status: 'active' },
        { name: 'Product 3', description: 'A product', price: 30, storeId: storeId1, status: 'paused' },
    ]);
  });

  afterAll(async () => {
    await Product.destroy({ where: { storeId: [storeId1, storeId2] } });
    await Store.destroy({ where: { id: [storeId1, storeId2] } });
    await User.destroy({ where: { id: [sellerId1, sellerId2] } });
  });

  describe('GET /api/products/mine', () => {
    test('devuelve 200 con productos active y paginación', async () => {
      const res = await request(app)
        .get('/api/products/mine?status=active&page=1&pageSize=20&sort=created_at:desc')
        .set('x-dev-seller-id', sellerId1);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every(p => p.status === 'active')).toBe(true);
    });

    test('requiere autenticación dev header', async () => {
      const res = await request(app).get('/api/products/mine');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('un vendedor puede eliminar su propio producto', async () => {
      const res = await request(app)
        .delete(`/api/products/${product1.id}`)
        .set('x-dev-seller-id', sellerId1);

      expect(res.status).toBe(204);

      const deletedProduct = await Product.findByPk(product1.id);
      expect(deletedProduct.status).toBe('deleted');
    });

    test('un vendedor no puede eliminar el producto de otro vendedor', async () => {
      const res = await request(app)
        .delete(`/api/products/${product1.id}`)
        .set('x-dev-seller-id', sellerId2);

      expect(res.status).toBe(403);
    });
  });
});
