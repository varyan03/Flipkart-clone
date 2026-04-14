const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');

let authCookies;
let userId;

afterAll(async () => {
  // Cleanup test user
  await prisma.user.deleteMany({ where: { email: 'test@flipkart.com' } });
  await prisma.$disconnect();
});

describe('Auth Endpoints', () => {
  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Test User', email: 'test@flipkart.com', password: 'password123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toEqual('test@flipkart.com');
    // Cookies should be set
    expect(res.headers['set-cookie']).toBeDefined();
    userId = res.body.data.user.id;
  });

  it('should not sign up with same email twice', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Test User', email: 'test@flipkart.com', password: 'password123' });
    expect(res.statusCode).toEqual(409);
  });

  it('should log in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@flipkart.com', password: 'password123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.user.name).toEqual('Test User');
    authCookies = res.headers['set-cookie'];
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@flipkart.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
  });

  it('should return current user on GET /auth/me with valid cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', authCookies);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.user.email).toEqual('test@flipkart.com');
  });

  it('should block GET /auth/me without cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toEqual(401);
  });

  it('should log out successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', authCookies);
    expect(res.statusCode).toEqual(200);
  });
});
