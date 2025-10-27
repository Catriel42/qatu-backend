import request from 'supertest';
import app from '../src/index.js';
import db from '../src/domain/models/index.js';

const { User, Store, Product, ProductImage } = db;

describe('GET /api/products/:id', () => {
  const sellerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const storeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
  const productId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
  const nonExistentProductId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';

  beforeAll(async () => {
    await User.create({ id: sellerId, iamId: sellerId, fullName: 'Product Detail Seller', email: 'product-detail-seller@test.com', password: 'password', role: 'seller' });
    await Store.create({ id: storeId, name: 'Detail Test Store', slug: 'detail-test-store', sellerId: sellerId, logoUrl: 'http://example.com/logo.png' });
    await Product.create({
      id: productId,
      name: 'Test Product',
      description: 'A product for testing details.',
      price: 99.99,
      stock: 10,
      storeId: storeId,
      categoryId: null,
      status: 'active',
    });
    await ProductImage.bulkCreate([
      { productId: productId, imageUrl: 'http://example.com/image1.png', displayOrder: 1 },
      { productId: productId, imageUrl: 'http://example.com/image2.png', displayOrder: 2 },
    ]);
  });

  afterAll(async () => {
    await ProductImage.destroy({ where: { product_id: productId } });
    await Product.destroy({ where: { id: productId } });
    await Store.destroy({ where: { id: storeId } });
    await User.destroy({ where: { id: sellerId } });
  });

  test('should return the full product details', async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
    expect(res.body.name).toBe('Test Product');
    expect(res.body.price).toBe('99.99');
    expect(res.body.stock).toBe(10);
    expect(res.body.store).toBeDefined();
    expect(res.body.store.name).toBe('Detail Test Store');
    expect(res.body.store.logo_url).toBe('http://example.com/logo.png');
    expect(res.body.images).toBeDefined();
    expect(res.body.images.length).toBe(2);
    expect(res.body.images[0].image_url).toBe('http://example.com/image1.png');
  });

  test('should return 404 for a non-existent product', async () => {
    const res = await request(app).get(`/api/products/${nonExistentProductId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  test('should return 400 for an invalid product ID format', async () => {
    const res = await request(app).get('/api/products/invalid-uuid');
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"id" must be a valid GUID');
  });
});
