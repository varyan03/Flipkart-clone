const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');

beforeAll(async () => {
  // Clear the DB completely and run the seed logic or just rely on what is there
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Product Endpoints', () => {
  it('GET /api/v1/products should return a paginated list of products', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('products');
    expect(res.body.data).toHaveProperty('total');
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  it('GET /api/v1/categories should return a list of categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
