/**
 * Database Migration and Auto-Seeder Utility for FleetTrack
 * Works for both MySQL (production) and SQLite (zero-config local dev)
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function runMigrations(db) {
  console.log('[Database] Checking & creating database schema...');

  // 1. Organizations
  await db.schema.hasTable('organizations').then(exists => {
    if (!exists) {
      return db.schema.createTable('organizations', table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('code', 50).notNullable().unique();
        table.timestamps(true, true);
      });
    }
  });

  // 2. Users
  await db.schema.hasTable('users').then(exists => {
    if (!exists) {
      return db.schema.createTable('users', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.string('name', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('password_hash', 255).notNullable();
        table.string('role', 50).notNullable().defaultTo('Driver');
        table.string('employee_id', 50);
        table.timestamps(true, true);
      });
    }
  });

  // 3. Vehicles
  await db.schema.hasTable('vehicles').then(exists => {
    if (!exists) {
      return db.schema.createTable('vehicles', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.string('vehicle_number', 50).notNullable();
        table.string('registration_number', 50).notNullable();
        table.string('vehicle_type', 50).notNullable().defaultTo('Truck');
        table.string('model', 100).notNullable();
        table.string('status', 50).defaultTo('Available');
        table.decimal('current_lat', 10, 8).defaultTo(37.774929);
        table.decimal('current_lng', 11, 8).defaultTo(-122.419418);
        table.timestamp('last_updated').defaultTo(db.fn.now());
        table.decimal('total_distance', 10, 2).defaultTo(0.00);
        table.integer('assigned_driver_id').unsigned().nullable();
        table.timestamps(true, true);
      });
    }
  });

  // 4. Drivers
  await db.schema.hasTable('drivers').then(exists => {
    if (!exists) {
      return db.schema.createTable('drivers', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
        table.string('name', 255).notNullable();
        table.string('email', 255).notNullable();
        table.string('phone', 50);
        table.string('employee_id', 50).notNullable();
        table.string('license_number', 100).notNullable();
        table.date('license_expiry');
        table.string('status', 50).defaultTo('Active');
        table.integer('assigned_vehicle_id').unsigned().nullable().references('id').inTable('vehicles').onDelete('SET NULL');
        table.timestamps(true, true);
      });
    }
  });

  // 5. Trips
  await db.schema.hasTable('trips').then(exists => {
    if (!exists) {
      return db.schema.createTable('trips', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.string('trip_number', 50).notNullable().unique();
        table.integer('driver_id').unsigned().notNullable().references('id').inTable('drivers');
        table.integer('vehicle_id').unsigned().notNullable().references('id').inTable('vehicles');
        table.string('origin_name', 255).notNullable();
        table.decimal('origin_lat', 10, 8).notNullable();
        table.decimal('origin_lng', 11, 8).notNullable();
        table.string('destination_name', 255).notNullable();
        table.decimal('destination_lat', 10, 8).notNullable();
        table.decimal('destination_lng', 11, 8).notNullable();
        table.timestamp('scheduled_start').notNullable();
        table.timestamp('scheduled_end').notNullable();
        table.timestamp('actual_start').nullable();
        table.timestamp('actual_end').nullable();
        table.text('route_waypoints').nullable();
        table.string('status', 50).defaultTo('Scheduled');
        table.decimal('distance_km', 10, 2).defaultTo(0.00);
        table.text('notes').nullable();
        table.timestamps(true, true);
      });
    }
  });

  // 6. Trip Locations
  await db.schema.hasTable('trip_locations').then(exists => {
    if (!exists) {
      return db.schema.createTable('trip_locations', table => {
        table.increments('id').primary();
        table.integer('trip_id').unsigned().notNullable().references('id').inTable('trips').onDelete('CASCADE');
        table.integer('vehicle_id').unsigned().notNullable().references('id').inTable('vehicles').onDelete('CASCADE');
        table.decimal('lat', 10, 8).notNullable();
        table.decimal('lng', 11, 8).notNullable();
        table.decimal('speed', 5, 2).defaultTo(0.00);
        table.timestamp('timestamp').defaultTo(db.fn.now());
      });
    }
  });

  // 7. Geofences
  await db.schema.hasTable('geofences').then(exists => {
    if (!exists) {
      return db.schema.createTable('geofences', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.string('name', 255).notNullable();
        table.decimal('center_lat', 10, 8).notNullable();
        table.decimal('center_lng', 11, 8).notNullable();
        table.integer('radius_meters').notNullable().defaultTo(500);
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
      });
    }
  });

  // 8. Geofence Events
  await db.schema.hasTable('geofence_events').then(exists => {
    if (!exists) {
      return db.schema.createTable('geofence_events', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.integer('geofence_id').unsigned().notNullable().references('id').inTable('geofences').onDelete('CASCADE');
        table.integer('vehicle_id').unsigned().notNullable().references('id').inTable('vehicles').onDelete('CASCADE');
        table.integer('trip_id').unsigned().nullable().references('id').inTable('trips').onDelete('SET NULL');
        table.string('event_type', 20).notNullable();
        table.string('message', 255).notNullable();
        table.timestamp('timestamp').defaultTo(db.fn.now());
      });
    }
  });

  // 9. Incidents
  await db.schema.hasTable('incidents').then(exists => {
    if (!exists) {
      return db.schema.createTable('incidents', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.integer('driver_id').unsigned().notNullable().references('id').inTable('drivers');
        table.integer('vehicle_id').unsigned().notNullable().references('id').inTable('vehicles');
        table.integer('trip_id').unsigned().nullable().references('id').inTable('trips').onDelete('SET NULL');
        table.string('incident_type', 100).notNullable();
        table.text('description').notNullable();
        table.string('location_name', 255).notNullable();
        table.string('severity', 50).defaultTo('Medium');
        table.string('status', 50).defaultTo('Pending');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

  // 10. Vehicle Inspections
  await db.schema.hasTable('vehicle_inspections').then(exists => {
    if (!exists) {
      return db.schema.createTable('vehicle_inspections', table => {
        table.increments('id').primary();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE');
        table.integer('driver_id').unsigned().notNullable().references('id').inTable('drivers');
        table.integer('vehicle_id').unsigned().notNullable().references('id').inTable('vehicles');
        table.boolean('brakes_passed').defaultTo(true);
        table.boolean('tires_passed').defaultTo(true);
        table.boolean('lights_passed').defaultTo(true);
        table.integer('fuel_level').defaultTo(100);
        table.boolean('damage_reported').defaultTo(false);
        table.text('notes').nullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

  console.log('[Database] Schema verification completed.');

  // Seed default data if empty
  const orgCount = await db('organizations').count('id as count').first();
  const count = orgCount ? (orgCount.count || orgCount['count(*)'] || 0) : 0;

  if (Number(count) === 0) {
    console.log('[Database] Seeding initial data...');
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

    // Orgs
    await db('organizations').insert([
      { id: 1, name: 'Apex Logistics Inc.', code: 'APEX-LOG' },
      { id: 2, name: 'Global Express Delivery', code: 'GLOB-EXP' }
    ]);

    // Users
    await db('users').insert([
      { id: 1, organization_id: 1, name: 'Sarah Jenkins (Admin)', email: 'admin@apexlogistics.com', password_hash: defaultPasswordHash, role: 'Admin', employee_id: 'EMP-APEX-001' },
      { id: 2, organization_id: 1, name: 'Marcus Vance (Manager)', email: 'manager@apexlogistics.com', password_hash: defaultPasswordHash, role: 'Manager', employee_id: 'EMP-APEX-002' },
      { id: 3, organization_id: 1, name: 'John Miller (Driver)', email: 'john.miller@apexlogistics.com', password_hash: defaultPasswordHash, role: 'Driver', employee_id: 'EMP-APEX-003' },
      { id: 4, organization_id: 1, name: 'Elena Rostova (Driver)', email: 'elena.r@apexlogistics.com', password_hash: defaultPasswordHash, role: 'Driver', employee_id: 'EMP-APEX-004' },
      { id: 5, organization_id: 2, name: 'David Chen (Admin)', email: 'admin@globalexpress.com', password_hash: defaultPasswordHash, role: 'Admin', employee_id: 'EMP-GLOB-001' },
      { id: 6, organization_id: 2, name: 'Rachel Adams (Manager)', email: 'manager@globalexpress.com', password_hash: defaultPasswordHash, role: 'Manager', employee_id: 'EMP-GLOB-002' },
      { id: 7, organization_id: 2, name: 'Carlos Santana (Driver)', email: 'carlos.s@globalexpress.com', password_hash: defaultPasswordHash, role: 'Driver', employee_id: 'EMP-GLOB-003' }
    ]);

    // Drivers
    await db('drivers').insert([
      { id: 1, organization_id: 1, user_id: 3, name: 'John Miller', email: 'john.miller@apexlogistics.com', phone: '+1-555-0192', employee_id: 'EMP-APEX-003', license_number: 'DL-CA-987654', license_expiry: '2028-05-15', status: 'Active' },
      { id: 2, organization_id: 1, user_id: 4, name: 'Elena Rostova', email: 'elena.r@apexlogistics.com', phone: '+1-555-0193', employee_id: 'EMP-APEX-004', license_number: 'DL-CA-456789', license_expiry: '2027-11-20', status: 'On Trip' },
      { id: 3, organization_id: 1, user_id: null, name: 'Robert Thorne', email: 'robert.t@apexlogistics.com', phone: '+1-555-0194', employee_id: 'EMP-APEX-005', license_number: 'DL-CA-112233', license_expiry: '2026-09-30', status: 'Active' },
      { id: 4, organization_id: 2, user_id: 7, name: 'Carlos Santana', email: 'carlos.s@globalexpress.com', phone: '+1-555-0881', employee_id: 'EMP-GLOB-003', license_number: 'DL-NY-554433', license_expiry: '2027-04-10', status: 'Active' },
      { id: 5, organization_id: 2, user_id: null, name: 'Michael Chang', email: 'michael.c@globalexpress.com', phone: '+1-555-0882', employee_id: 'EMP-GLOB-004', license_number: 'DL-NY-998877', license_expiry: '2028-12-01', status: 'Off Duty' }
    ]);

    // Vehicles
    await db('vehicles').insert([
      { id: 1, organization_id: 1, vehicle_number: 'TRK-101', registration_number: 'REG-APEX-901', vehicle_type: 'Heavy Duty Truck', model: 'Volvo FH16 (2023)', status: 'Available', current_lat: 37.774929, current_lng: -122.419418, total_distance: 14250.50, assigned_driver_id: 1 },
      { id: 2, organization_id: 1, vehicle_number: 'VAN-202', registration_number: 'REG-APEX-902', vehicle_type: 'Cargo Van', model: 'Ford Transit 350', status: 'On Trip', current_lat: 37.783300, current_lng: -122.416700, total_distance: 8920.00, assigned_driver_id: 2 },
      { id: 3, organization_id: 1, vehicle_number: 'TRK-103', registration_number: 'REG-APEX-903', vehicle_type: 'Freight Semi-Truck', model: 'Freightliner Cascadia', status: 'Maintenance', current_lat: 37.765000, current_lng: -122.430000, total_distance: 31400.75, assigned_driver_id: null },
      { id: 4, organization_id: 1, vehicle_number: 'EV-301', registration_number: 'REG-APEX-904', vehicle_type: 'Electric Cargo', model: 'Rivian EDV 700', status: 'Available', current_lat: 37.790000, current_lng: -122.400000, total_distance: 4200.30, assigned_driver_id: 3 },
      { id: 5, organization_id: 2, vehicle_number: 'GLOB-VAN-01', registration_number: 'REG-GLOB-101', vehicle_type: 'Delivery Van', model: 'Mercedes Sprinter', status: 'On Trip', current_lat: 40.712776, current_lng: -74.005974, total_distance: 19500.00, assigned_driver_id: 4 },
      { id: 6, organization_id: 2, vehicle_number: 'GLOB-TRK-02', registration_number: 'REG-GLOB-102', vehicle_type: 'Flatbed Truck', model: 'Isuzu N-Series', status: 'Available', current_lat: 40.730610, current_lng: -73.935242, total_distance: 27800.25, assigned_driver_id: 5 }
    ]);

    // Update driver vehicle linkage
    await db('drivers').where('id', 1).update({ assigned_vehicle_id: 1 });
    await db('drivers').where('id', 2).update({ assigned_vehicle_id: 2 });
    await db('drivers').where('id', 3).update({ assigned_vehicle_id: 4 });
    await db('drivers').where('id', 4).update({ assigned_vehicle_id: 5 });
    await db('drivers').where('id', 5).update({ assigned_vehicle_id: 6 });

    // Geofences
    await db('geofences').insert([
      { id: 1, organization_id: 1, name: 'SF Main Hub & Warehouse', center_lat: 37.774929, center_lng: -122.419418, radius_meters: 800, is_active: 1 },
      { id: 2, organization_id: 1, name: 'Port of Oakland Terminal', center_lat: 37.804363, center_lng: -122.271111, radius_meters: 1200, is_active: 1 },
      { id: 3, organization_id: 1, name: 'SFO Logistics Yard', center_lat: 37.621313, center_lng: -122.378955, radius_meters: 1000, is_active: 1 },
      { id: 4, organization_id: 2, name: 'JFK Cargo Depot', center_lat: 40.641311, center_lng: -73.778137, radius_meters: 1500, is_active: 1 },
      { id: 5, organization_id: 2, name: 'Manhattan Express Center', center_lat: 40.758896, center_lng: -73.985130, radius_meters: 600, is_active: 1 }
    ]);

    // Trips
    await db('trips').insert([
      {
        id: 1,
        organization_id: 1,
        trip_number: 'TRIP-2026-001',
        driver_id: 2,
        vehicle_id: 2,
        origin_name: 'SF Main Hub & Warehouse',
        origin_lat: 37.774929,
        origin_lng: -122.419418,
        destination_name: 'Port of Oakland Terminal',
        destination_lat: 37.804363,
        destination_lng: -122.271111,
        scheduled_start: '2026-08-25 10:00:00',
        scheduled_end: '2026-08-25 12:30:00',
        actual_start: '2026-08-25 10:05:00',
        status: 'In Progress',
        distance_km: 18.50,
        notes: 'Priority electronics shipment',
        route_waypoints: JSON.stringify([
          { lat: 37.774929, lng: -122.419418 },
          { lat: 37.785, lng: -122.395 },
          { lat: 37.798, lng: -122.340 },
          { lat: 37.804363, lng: -122.271111 }
        ])
      },
      {
        id: 2,
        organization_id: 1,
        trip_number: 'TRIP-2026-002',
        driver_id: 1,
        vehicle_id: 1,
        origin_name: 'SF Main Hub & Warehouse',
        origin_lat: 37.774929,
        origin_lng: -122.419418,
        destination_name: 'SFO Logistics Yard',
        destination_lat: 37.621313,
        destination_lng: -122.378955,
        scheduled_start: '2026-08-25 14:00:00',
        scheduled_end: '2026-08-25 16:00:00',
        status: 'Assigned',
        distance_km: 22.10,
        notes: 'Automotive spare parts transfer',
        route_waypoints: JSON.stringify([
          { lat: 37.774929, lng: -122.419418 },
          { lat: 37.700, lng: -122.400 },
          { lat: 37.621313, lng: -122.378955 }
        ])
      },
      {
        id: 3,
        organization_id: 1,
        trip_number: 'TRIP-2026-003',
        driver_id: 3,
        vehicle_id: 4,
        origin_name: 'SFO Logistics Yard',
        origin_lat: 37.621313,
        origin_lng: -122.378955,
        destination_name: 'SF Main Hub & Warehouse',
        destination_lat: 37.774929,
        destination_lng: -122.419418,
        scheduled_start: '2026-08-24 08:00:00',
        scheduled_end: '2026-08-24 10:00:00',
        actual_start: '2026-08-24 08:02:00',
        actual_end: '2026-08-24 09:55:00',
        status: 'Completed',
        distance_km: 21.80,
        notes: 'Scheduled return shipment completed cleanly',
        route_waypoints: JSON.stringify([
          { lat: 37.621313, lng: -122.378955 },
          { lat: 37.774929, lng: -122.419418 }
        ])
      },
      {
        id: 4,
        organization_id: 2,
        trip_number: 'TRIP-GLOB-901',
        driver_id: 4,
        vehicle_id: 5,
        origin_name: 'JFK Cargo Depot',
        origin_lat: 40.641311,
        origin_lng: -73.778137,
        destination_name: 'Manhattan Express Center',
        destination_lat: 40.758896,
        destination_lng: -73.985130,
        scheduled_start: '2026-08-25 11:00:00',
        scheduled_end: '2026-08-25 13:00:00',
        actual_start: '2026-08-25 11:15:00',
        status: 'In Progress',
        distance_km: 25.40,
        notes: 'Medical supply express delivery',
        route_waypoints: JSON.stringify([
          { lat: 40.641311, lng: -73.778137 },
          { lat: 40.710, lng: -73.950 },
          { lat: 40.758896, lng: -73.985130 }
        ])
      }
    ]);

    // Geofence Events
    await db('geofence_events').insert([
      { id: 1, organization_id: 1, geofence_id: 1, vehicle_id: 2, trip_id: 1, event_type: 'EXIT', message: 'Vehicle VAN-202 exited SF Main Hub & Warehouse zone' },
      { id: 2, organization_id: 1, geofence_id: 3, vehicle_id: 4, trip_id: 3, event_type: 'ENTER', message: 'Vehicle EV-301 entered SFO Logistics Yard zone' },
      { id: 3, organization_id: 2, geofence_id: 4, vehicle_id: 5, trip_id: 4, event_type: 'EXIT', message: 'Vehicle GLOB-VAN-01 exited JFK Cargo Depot zone' }
    ]);

    // Incidents
    await db('incidents').insert([
      { id: 1, organization_id: 1, driver_id: 2, vehicle_id: 2, trip_id: 1, incident_type: 'Traffic Congestion Delay', description: 'Heavy congestion on Bay Bridge causing 20 min estimated delay.', location_name: 'I-80 East Bridge Toll', severity: 'Low', status: 'Pending' },
      { id: 2, organization_id: 1, driver_id: 1, vehicle_id: 3, trip_id: null, incident_type: 'Engine Warning Light', description: 'Check engine light triggered during pre-trip inspection.', location_name: 'SF Hub Maintenance Bay', severity: 'Medium', status: 'Under Review' }
    ]);

    // Vehicle Inspections
    await db('vehicle_inspections').insert([
      { id: 1, organization_id: 1, driver_id: 2, vehicle_id: 2, brakes_passed: true, tires_passed: true, lights_passed: true, fuel_level: 95, damage_reported: false, notes: 'Pre-trip checklist cleared. Vehicle in optimal condition.' },
      { id: 2, organization_id: 1, driver_id: 1, vehicle_id: 1, brakes_passed: true, tires_passed: true, lights_passed: true, fuel_level: 80, damage_reported: false, notes: 'Morning routine inspection completed cleanly.' },
      { id: 3, organization_id: 2, driver_id: 4, vehicle_id: 5, brakes_passed: true, tires_passed: true, lights_passed: true, fuel_level: 88, damage_reported: false, notes: 'Cargo van verified. All systems normal.' }
    ]);

    console.log('[Database] Initial demo seeding completed successfully!');
  }
}

module.exports = { runMigrations };
