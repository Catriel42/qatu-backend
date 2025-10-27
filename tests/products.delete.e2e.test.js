import request from 'supertest';
import app from '../src/index.js';
import db from '../src/domain/models/index.js';

const { User, Store, Product, Category } = db;

describe('DELETE /api/products/:id', () => {
  let seller1, seller2, store1, category1, product1, product2;

  beforeEach(async () => {
    // Clean up
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await Store.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    await Category.destroy({ where: {}, truncate: true, cascade: true });

    // Create users
    seller1 = await User.create({ id: 'd5a5a5a5-5a5a-5a5a-5a5a-5a5a5a5a5a5a', iamId: 'seller1-iam', fullName: 'Seller One', email: 'seller1@test.com', role: 'seller' });
    seller2 = await User.create({ id: 'b5b5b5b5-5b5b-5b5b-5b5b-5b5b5b5b5b5b', iamId: 'seller2-iam', fullName: 'Seller Two', email: 'seller2@test.com', role: 'seller' });

    // Create store and category
    store1 = await Store.create({ id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', name: 'Seller One Store', sellerId: seller1.id, slug: 'seller-one-store' });
    category1 = await Category.create({ id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', name: 'Electronics', slug: 'electronics' });

    // Create products
    product1 = await Product.create({ id: 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', name: 'My Product', description: '...', price: 100, storeId: store1.id, categoryId: category1.id, status: 'active' });
    product2 = await Product.create({ id: 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', name: 'Another Product', description: '...', price: 200, storeId: store1.id, categoryId: category1.id, status: 'active' });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('should return 204 and soft delete the product if the seller owns it', async () => {
    const res = await request(app)
      .delete(`/api/products/${product1.id}`)
      .set('x-dev-seller-id', seller1.id);

    expect(res.status).toBe(204);

    // Verify the product status is now 'deleted'
    const deletedProduct = await Product.findByPk(product1.id);
    expect(deletedProduct.status).toBe('deleted');
  });

  test('should return 403 if the seller does not own the product', async () => {
    const res = await request(app)
      .delete(`/api/products/${product2.id}`)
      .set('x-dev-seller-id', seller2.id); // seller2 tries to delete product2 which belongs to seller1

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: You do not own this product.');
  });

  test('should return 404 if the product does not exist', async () => {
    const nonExistentProductId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .delete(`/api/products/${nonExistentProductId}`)
      .set('x-dev-seller-id', seller1.id);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found.');
  });

  test('should return 401 if the seller ID is missing', async () => {
    const res = await request(app)
      .delete(`/api/products/${product2.id}`);

    expect(res.status).toBe(401);
  });
});
