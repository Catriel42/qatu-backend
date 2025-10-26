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

describe('ProductRepository.findById', () => {
  const sellerId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
  const storeId = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';
  let productId;

  beforeAll(async () => {
    await User.create({ id: sellerId, iamId: sellerId, fullName: 'Find Test Seller', email: 'find-seller@test.com', password: 'password', role: 'seller' });
    await Store.create({ id: storeId, sellerId, name: 'Find Test Store', slug: 'find-test-store' });
    const product = await Product.create({ name: 'Findable Product', description: 'A product to find', price: 100, storeId, status: 'active' });
    productId = product.id;
  });

  afterAll(async () => {
    await Product.destroy({ where: { storeId } });
    await Store.destroy({ where: { id: storeId } });
    await User.destroy({ where: { id: sellerId } });
  });

  it('debe encontrar un producto por su ID y el ID del vendedor', async () => {
    const foundProduct = await ProductRepository.findById(productId, sellerId);
    expect(foundProduct).toBeDefined();
    expect(foundProduct.id).toBe(productId);
  });

  it('debe devolver null si el producto no existe', async () => {
    const nonExistentProductId = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const foundProduct = await ProductRepository.findById(nonExistentProductId, sellerId);
    expect(foundProduct).toBeNull();
  });

  it('debe devolver null si el producto no pertenece al vendedor', async () => {
    const otherSellerId = 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4';
    await User.create({ id: otherSellerId, iamId: otherSellerId, fullName: 'Other Seller', email: 'other-seller@test.com', password: 'password', role: 'seller' });
    const foundProduct = await ProductRepository.findById(productId, otherSellerId);
    expect(foundProduct).toBeNull();
    await User.destroy({ where: { id: otherSellerId } });
  });
});
