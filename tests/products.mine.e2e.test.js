import request from 'supertest';
import app from '../src/index.js';

describe('GET /api/products/mine', () => {
  test('devuelve 200 con productos active y paginación', async () => {
    const res = await request(app)
      .get('/api/products/mine?status=active&page=1&pageSize=20&sort=created_at:desc')
      .set('x-dev-seller-id', '11111111-1111-1111-1111-111111111111');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every(p => p.status === 'active')).toBe(true);
  });

  test('requiere autenticación dev header', async () => {
    const res = await request(app).get('/api/products/mine');
    expect(res.status).toBe(401);
  });
});
