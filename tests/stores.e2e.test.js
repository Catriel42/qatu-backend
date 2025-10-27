import request from 'supertest';
import app from '../src/index.js';
import db from '../src/domain/models/index.js';

const { User, Store } = db;

// US-012: Set Up My Store
describe('POST /api/stores', () => {
  const sellerId = '33333333-3333-3333-3333-333333333333';

  beforeEach(async () => {
    await User.create({ id: sellerId, iamId: sellerId, fullName: 'Store Test Seller', email: 'store-seller@test.com', password: 'password', role: 'seller' });
  });

  afterAll(async () => {
    await Store.destroy({ where: { sellerId } });
    await User.destroy({ where: { id: sellerId } });
  });

  const storeData = {
    name: 'My Awesome Test Store',
    description: 'The best store for testing purposes.',
    shippingPolicy: 'We ship fast!',
    returnPolicy: 'No returns, all sales are final!',
  };

  test('should create a new store and return 201', async () => {
    const res = await request(app)
      .post('/api/stores')
      .set('x-dev-seller-id', sellerId)
      .send(storeData);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Store set up successfully!');
    expect(res.body.store.name).toBe(storeData.name);
    expect(res.body.store.sellerId).toBe(sellerId);
  });

  test('should return 409 if the seller already has a store', async () => {
    // Create the first store for the seller
    await request(app)
      .post('/api/stores')
      .set('x-dev-seller-id', sellerId)
      .send(storeData);

    // Now attempt to create a second store for the same seller
    const res = await request(app)
      .post('/api/stores')
      .set('x-dev-seller-id', sellerId) // Same seller ID
      .send({ ...storeData, name: 'Another Store' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Seller already has a store.');
  });

  test('should return 401 if seller ID is missing', async () => {
    const res = await request(app)
      .post('/api/stores')
      .send(storeData);

    expect(res.status).toBe(401);
  });

  test('should return 400 for invalid data (missing name)', async () => {
    const { name, ...invalidData } = storeData;
    const res = await request(app)
      .post('/api/stores')
      .set('x-dev-seller-id', '44444444-4444-4444-4444-444444444444') // New seller
      .send(invalidData);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain('\"name\" is a required field');
  });
});
