const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');

let cartId;
let productId;

beforeAll(async () => {
  const product = await prisma.product.findFirst();
  productId = product.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Cart & Order Endpoints', () => {
  it('should create a cart', async () => {
    const res = await request(app).post('/api/v1/cart');
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('cartId');
    cartId = res.body.data.cartId;
  });

  it('should add an item to the cart', async () => {
    const res = await request(app)
      .post(`/api/v1/cart/${cartId}/items`)
      .send({ productId, quantity: 2 });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productId).toEqual(productId);
    expect(res.body.data.quantity).toEqual(2);
  });

  it('should place an order from the cart', async () => {
    const address = {
      fullName: 'John Doe',
      phone: '9876543210',
      pincode: '100001',
      line1: '123 Test St',
      city: 'Test City',
      state: 'Test State'
    };

    const res = await request(app)
      .post('/api/v1/orders')
      .send({ cartId, address });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('orderId');
  });
});
