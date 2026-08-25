const request = require('supertest');
const { app, ensureDatabase } = require('../server');

describe('Authentication API Endpoints', () => {
  beforeAll(async () => {
    await ensureDatabase();
  });

  test('POST /api/auth/register — Register new organization and admin', async () => {
    const orgCode = `TEST${Math.floor(1000 + Math.random() * 9000)}`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin User',
        email: `admin_${Date.now()}@testfleet.com`,
        password: 'Password123!',
        role: 'Admin',
        organization_name: 'Test Logistics Inc',
        organization_code: orgCode
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBeDefined();
  });

  test('POST /api/auth/login — Successful login with demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@apexlogistics.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Admin');
  });

  test('POST /api/auth/login — Fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@apexlogistics.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me — Return current user details with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@apexlogistics.com',
        password: 'Password123!'
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe('admin@apexlogistics.com');
  });
});
