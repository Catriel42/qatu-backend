import request from 'supertest';
import app from '../src/index.js';
import db from '../src/domain/models/index.js';

const { User, Store, Category, Product } = db;

describe('GET /api/products/search', () => {
  const sellerId = '77777777-7777-7777-7777-777777777777';
  const storeId = '88888888-8888-8888-8888-888888888888';
  const categoryId1 = '99999999-9999-9999-9999-999999999991';
  const categoryId2 = '99999999-9999-9999-9999-999999999992';

  beforeAll(async () => {
    await User.create({ id: sellerId, iamId: sellerId, fullName: 'Search Test Seller', email: 'search-seller@test.com', role: 'seller' });
    await Store.create({ id: storeId, sellerId, name: 'Search Test Store', slug: 'search-test-store' });
    await Category.create({ id: categoryId1, name: 'Electronics', slug: 'electronics' });
    await Category.create({ id: categoryId2, name: 'Books', slug: 'books' });

    await Product.bulkCreate([
      {
        name: 'Laptop Pro',
        description: 'A powerful laptop for professionals',
        price: 1500,
        storeId,
        categoryId: categoryId1,
        status: 'active',
      },
      {
        name: 'The Great Gatsby',
        description: 'A classic novel',
        price: 20,
        storeId,
        categoryId: categoryId2,
        status: 'active',
      },
      {
        name: 'Wireless Mouse',
        description: 'An ergonomic wireless mouse',
        price: 50,
        storeId,
        categoryId: categoryId1,
        status: 'active',
      },
      {
        name: 'Old Phone',
        description: 'An outdated phone',
        price: 100,
        storeId,
        categoryId: categoryId1,
        status: 'archived',
      },
    ]);
  });

  afterAll(async () => {
    await Product.destroy({ where: { storeId } });
    await Category.destroy({ where: { id: [categoryId1, categoryId2] } });
    await Store.destroy({ where: { id: storeId } });
    await User.destroy({ where: { id: sellerId } });
  });

  test('should return products matching the keyword in the name', async () => {
    const res = await request(app).get('/api/products/search?q=laptop');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Laptop Pro');
  });

  test('should return products matching the keyword in the description', async () => {
    const res = await request(app).get('/api/products/search?q=classic');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('The Great Gatsby');
  });

  test('should return products matching the keyword in the category name', async () => {
    const res = await request(app).get('/api/products/search?q=electronics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  test('should be case-insensitive', async () => {
    const res = await request(app).get('/api/products/search?q=LAPT');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Laptop Pro');
  });

  test('should not return non-active products', async () => {
    const res = await request(app).get('/api/products/search?q=phone');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('should return an empty array if no products match', async () => {
    const res = await request(app).get('/api/products/search?q=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('should handle pagination', async () => {
    const res = await request(app).get('/api/products/search?q=e&pageSize=1&page=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.page).toBe(2);
    expect(res.body.pageSize).toBe(1);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(3);
  });
});
