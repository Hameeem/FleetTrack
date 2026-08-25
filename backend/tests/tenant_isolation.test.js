const request = require('supertest');
const { app, ensureDatabase } = require('../server');
const db = require('../src/config/db');

describe('Multi-Tenant Isolation Protection Tests', () => {
  let tokenOrgA;
  let tokenOrgB;

  beforeAll(async () => {
    await ensureDatabase();

    // Login Org A (Apex Logistics)
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@apexlogistics.com', password: 'Password123!' });
    tokenOrgA = resA.body.token;

    // Login Org B (Global Express)
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@globalexpress.com', password: 'Password123!' });
    tokenOrgB = resB.body.token;
  });

  test('Org A cannot view Org B trips', async () => {
    const resA = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${tokenOrgA}`);

    expect(resA.statusCode).toBe(200);
    const tripNumbers = resA.body.trips.map(t => t.trip_number);
    expect(tripNumbers).not.toContain('TRIP-GLOB-901');
  });

  test('Org A querying single Org B trip ID returns 404', async () => {
    const orgBTrip = await db('trips').where('organization_id', 2).first();
    if (!orgBTrip) return;

    const res = await request(app)
      .get(`/api/trips/${orgBTrip.id}`)
      .set('Authorization', `Bearer ${tokenOrgA}`);

    expect(res.statusCode).toBe(404);
  });

  test('Org A cannot view Org B vehicles', async () => {
    const resA = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${tokenOrgA}`);

    expect(resA.statusCode).toBe(200);
    const vehicleNumbers = resA.body.vehicles.map(v => v.vehicle_number);
    expect(vehicleNumbers).not.toContain('GLOB-VAN-01');
  });
});
