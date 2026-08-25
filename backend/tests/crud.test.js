const request = require('supertest');
const { app, ensureDatabase } = require('../server');

describe('CRUD Operations Tests for Drivers, Vehicles, and Trips', () => {
  let adminToken;

  beforeAll(async () => {
    await ensureDatabase();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@apexlogistics.com', password: 'Password123!' });
    adminToken = res.body.token;
  });

  test('Create driver, create vehicle, create trip lifecycle', async () => {
    // 1. Create Driver
    const empId = `EMP-TEST-${Date.now().toString().slice(-4)}`;
    const driverRes = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Samantha Speed',
        email: `samantha_${Date.now()}@apexlogistics.com`,
        phone: '+1-555-9988',
        employee_id: empId,
        license_number: 'DL-CA-998811',
        license_expiry: '2029-01-01',
        status: 'Active'
      });

    expect(driverRes.statusCode).toBe(201);
    const driverId = driverRes.body.driver.id;

    // 2. Create Vehicle
    const vehNum = `VAN-TEST-${Date.now().toString().slice(-4)}`;
    const vehicleRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vehicle_number: vehNum,
        registration_number: `REG-VT-${Date.now().toString().slice(-4)}`,
        vehicle_type: 'Cargo Van',
        model: 'Mercedes eSprinter',
        status: 'Available',
        assigned_driver_id: driverId
      });

    expect(vehicleRes.statusCode).toBe(201);
    const vehicleId = vehicleRes.body.vehicle.id;

    // 3. Create Trip
    const tripRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        driver_id: driverId,
        vehicle_id: vehicleId,
        origin_name: 'SF Distribution Center',
        origin_lat: 37.774929,
        origin_lng: -122.419418,
        destination_name: 'Silicon Valley Campus',
        destination_lat: 37.386051,
        destination_lng: -122.083855,
        scheduled_start: '2026-08-26 09:00:00',
        scheduled_end: '2026-08-26 11:00:00',
        distance_km: 55.2
      });

    expect(tripRes.statusCode).toBe(201);
    const tripId = tripRes.body.trip.id;

    // 4. Start Trip
    const startRes = await request(app)
      .post(`/api/trips/${tripId}/start`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(startRes.statusCode).toBe(200);

    // 5. Complete Trip
    const completeRes = await request(app)
      .post(`/api/trips/${tripId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(completeRes.statusCode).toBe(200);
  });
});
