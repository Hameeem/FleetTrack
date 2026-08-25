const request = require('supertest');
const { app, ensureDatabase } = require('../server');

describe('Role-Based Access Control (RBAC) Tests', () => {
  let driverToken;
  let adminToken;

  beforeAll(async () => {
    await ensureDatabase();

    // Login Driver
    const driverRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.miller@apexlogistics.com', password: 'Password123!' });
    driverToken = driverRes.body.token;

    // Login Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@apexlogistics.com', password: 'Password123!' });
    adminToken = adminRes.body.token;
  });

  test('Driver is blocked from creating a vehicle (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        vehicle_number: 'ILLEGAL-01',
        registration_number: 'REG-FAIL',
        vehicle_type: 'Truck',
        model: 'Unauthorized Model'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Admin is allowed to create a vehicle (201 Created)', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vehicle_number: `TRK-TEST-${Date.now().toString().slice(-4)}`,
        registration_number: `REG-OK-${Date.now().toString().slice(-4)}`,
        vehicle_type: 'Electric Cargo',
        model: 'Tesla Semi (2024)',
        status: 'Available'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
