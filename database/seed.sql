-- FleetTrack Multi-Tenant Seed Data

-- 1. Organizations
INSERT INTO organizations (id, name, code) VALUES
(1, 'Apex Logistics Inc.', 'APEX-LOG'),
(2, 'Global Express Delivery', 'GLOB-EXP');

-- 2. Users (Password for all demo accounts: "Password123!")
-- Pre-hashed with bcrypt: $2a$10$w6B.jG6vA6Pq6N9U1fV8yO6q.X2H6ZzVnJpP5GzH6BvJ6WzH6
-- We will use a standard hashed password string in backend seeder, e.g. bcrypt.hashSync('Password123!', 10)
INSERT INTO users (id, organization_id, name, email, password_hash, role, employee_id) VALUES
(1, 1, 'Sarah Jenkins (Admin)', 'admin@apexlogistics.com', '$2a$10$1W423yXl1o4K3001v6gT3.JjI6g1qg54nQx7fO6a22gGk1w/XG2wW', 'Admin', 'EMP-APEX-001'),
(2, 1, 'Marcus Vance (Manager)', 'manager@apexlogistics.com', '$2a$10$1W423yXl1o4K3001v6gT3.JjI6g1qg54nQx7fO6a22gGk1w/XG2wW', 'Manager', 'EMP-APEX-002'),
(3, 1, 'John Miller (Driver)', 'john.miller@apexlogistics.com', '$2a$10$1W423yXl1o4K3001v6gT3.JjI6g1qg54nQx7fO6a22gGk1w/XG2wW', 'Driver', 'EMP-APEX-003'),
(4, 1, 'Elena Rostova (Driver)', 'elena.r@apexlogistics.com', '$2a$10$1W423yXl1o4K3001v6gT3.JjI6g1qg54nQx7fO6a22gGk1w/XG2wW', 'Driver', 'EMP-APEX-004'),

(5, 2, 'David Chen (Admin)', 'admin@globalexpress.com', '$2a$10$1W423yXl1o4K3001v6gT3.JjI6g1qg54nQx7fO6a22gGk1w/XG2wW', 'Admin', 'EMP-GLOB-001'),
(6, 2, 'Rachel Adams (Manager)', 'manager@globalexpress.com', '$2a$10$1W423yXl1o4K3001v6gT3.JjI6g1qg54nQx7fO6a22gGk1w/XG2wW', 'Manager', 'EMP-GLOB-002'),
(7, 2, 'Carlos Santana (Driver)', 'carlos.s@globalexpress.com', '$2a$10$1W423yXl1o4K3001v6gT3.JjI6g1qg54nQx7fO6a22gGk1w/XG2wW', 'Driver', 'EMP-GLOB-003');

-- 3. Drivers
INSERT INTO drivers (id, organization_id, user_id, name, email, phone, employee_id, license_number, license_expiry, status) VALUES
(1, 1, 3, 'John Miller', 'john.miller@apexlogistics.com', '+1-555-0192', 'EMP-APEX-003', 'DL-CA-987654', '2028-05-15', 'Active'),
(2, 1, 4, 'Elena Rostova', 'elena.r@apexlogistics.com', '+1-555-0193', 'EMP-APEX-004', 'DL-CA-456789', '2027-11-20', 'On Trip'),
(3, 1, NULL, 'Robert Thorne', 'robert.t@apexlogistics.com', '+1-555-0194', 'EMP-APEX-005', 'DL-CA-112233', '2026-09-30', 'Active'),

(4, 2, 7, 'Carlos Santana', 'carlos.s@globalexpress.com', '+1-555-0881', 'EMP-GLOB-003', 'DL-NY-554433', '2027-04-10', 'Active'),
(5, 2, NULL, 'Michael Chang', 'michael.c@globalexpress.com', '+1-555-0882', 'EMP-GLOB-004', 'DL-NY-998877', '2028-12-01', 'Off Duty');

-- 4. Vehicles
INSERT INTO vehicles (id, organization_id, vehicle_number, registration_number, vehicle_type, model, status, current_lat, current_lng, total_distance, assigned_driver_id) VALUES
(1, 1, 'TRK-101', 'REG-APEX-901', 'Heavy Duty Truck', 'Volvo FH16 (2023)', 'Available', 37.774929, -122.419418, 14250.50, 1),
(2, 1, 'VAN-202', 'REG-APEX-902', 'Cargo Van', 'Ford Transit 350', 'On Trip', 37.783300, -122.416700, 8920.00, 2),
(3, 1, 'TRK-103', 'REG-APEX-903', 'Freight Semi-Truck', 'Freightliner Cascadia', 'Maintenance', 37.765000, -122.430000, 31400.75, NULL),
(4, 1, 'EV-301', 'REG-APEX-904', 'Electric Cargo', 'Rivian EDV 700', 'Available', 37.790000, -122.400000, 4200.30, 3),

(5, 2, 'GLOB-VAN-01', 'REG-GLOB-101', 'Delivery Van', 'Mercedes Sprinter', 'On Trip', 40.712776, -74.005974, 19500.00, 4),
(6, 2, 'GLOB-TRK-02', 'REG-GLOB-102', 'Flatbed Truck', 'Isuzu N-Series', 'Available', 40.730610, -73.935242, 27800.25, 5);

-- Link drivers back to assigned vehicles
UPDATE drivers SET assigned_vehicle_id = 1 WHERE id = 1;
UPDATE drivers SET assigned_vehicle_id = 2 WHERE id = 2;
UPDATE drivers SET assigned_vehicle_id = 4 WHERE id = 3;
UPDATE drivers SET assigned_vehicle_id = 5 WHERE id = 4;
UPDATE drivers SET assigned_vehicle_id = 6 WHERE id = 5;

-- 5. Geofences
INSERT INTO geofences (id, organization_id, name, center_lat, center_lng, radius_meters, is_active) VALUES
(1, 1, 'SF Main Hub & Warehouse', 37.774929, -122.419418, 800, 1),
(2, 1, 'Port of Oakland Terminal', 37.804363, -122.271111, 1200, 1),
(3, 1, 'SFO Logistics Yard', 37.621313, -122.378955, 1000, 1),

(4, 2, 'JFK Cargo Depot', 40.641311, -73.778137, 1500, 1),
(5, 2, 'Manhattan Express Center', 40.758896, -73.985130, 600, 1);

-- 6. Trips
INSERT INTO trips (id, organization_id, trip_number, driver_id, vehicle_id, origin_name, origin_lat, origin_lng, destination_name, destination_lat, destination_lng, scheduled_start, scheduled_end, actual_start, status, distance_km, notes, route_waypoints) VALUES
(1, 1, 'TRIP-2026-001', 2, 2, 'SF Main Hub & Warehouse', 37.774929, -122.419418, 'Port of Oakland Terminal', 37.804363, -122.271111, '2026-08-25 10:00:00', '2026-08-25 12:30:00', '2026-08-25 10:05:00', 'In Progress', 18.50, 'Priority electronics shipment', '[{"lat":37.774929,"lng":-122.419418},{"lat":37.785,"lng":-122.395},{"lat":37.804363,"lng":-122.271111}]'),
(2, 1, 'TRIP-2026-002', 1, 1, 'SF Main Hub & Warehouse', 37.774929, -122.419418, 'SFO Logistics Yard', 37.621313, -122.378955, '2026-08-25 14:00:00', '2026-08-25 16:00:00', NULL, 'Assigned', 22.10, 'Automotive spare parts transfer', '[{"lat":37.774929,"lng":-122.419418},{"lat":37.700,"lng":-122.400},{"lat":37.621313,"lng":-122.378955}]'),
(3, 1, 'TRIP-2026-003', 3, 4, 'SFO Logistics Yard', 37.621313, -122.378955, 'SF Main Hub & Warehouse', 37.774929, -122.419418, '2026-08-24 08:00:00', '2026-08-24 10:00:00', '2026-08-24 08:02:00', 'Completed', 21.80, 'Scheduled return shipment completed cleanly', '[{"lat":37.621313,"lng":-122.378955},{"lat":37.774929,"lng":-122.419418}]'),

(4, 2, 'TRIP-GLOB-901', 4, 5, 'JFK Cargo Depot', 40.641311, -73.778137, 'Manhattan Express Center', 40.758896, -73.985130, '2026-08-25 11:00:00', '2026-08-25 13:00:00', '2026-08-25 11:15:00', 'In Progress', 25.40, 'Medical supply express delivery', '[{"lat":40.641311,"lng":-73.778137},{"lat":40.710,"lng":-73.950},{"lat":40.758896,"lng":-73.985130}]');

-- 7. Geofence Events
INSERT INTO geofence_events (id, organization_id, geofence_id, vehicle_id, trip_id, event_type, message, timestamp) VALUES
(1, 1, 1, 2, 1, 'EXIT', 'Vehicle VAN-202 exited SF Main Hub & Warehouse zone', '2026-08-25 10:06:12'),
(2, 1, 3, 4, 3, 'ENTER', 'Vehicle EV-301 entered SFO Logistics Yard zone', '2026-08-24 08:03:45'),
(3, 2, 4, 5, 4, 'EXIT', 'Vehicle GLOB-VAN-01 exited JFK Cargo Depot zone', '2026-08-25 11:16:00');

-- 8. Incidents
INSERT INTO incidents (id, organization_id, driver_id, vehicle_id, trip_id, incident_type, description, location_name, severity, status) VALUES
(1, 1, 2, 2, 1, 'Traffic Congestion Delay', 'Heavy congestion on Bay Bridge causing 20 min estimated delay.', 'I-80 East Bridge Toll', 'Low', 'Pending'),
(2, 1, 1, 3, NULL, 'Engine Warning Light', 'Check engine light triggered during pre-trip inspection.', 'SF Hub Maintenance Bay', 'Medium', 'Under Review');

-- 9. Vehicle Inspections
INSERT INTO vehicle_inspections (id, organization_id, driver_id, vehicle_id, brakes_passed, tires_passed, lights_passed, fuel_level, damage_reported, notes) VALUES
(1, 1, 2, 2, 1, 1, 1, 95, 0, 'Pre-trip checklist cleared. Vehicle in optimal condition.'),
(2, 1, 1, 1, 1, 1, 1, 80, 0, 'Morning routine inspection completed cleanly.'),
(3, 2, 4, 5, 1, 1, 1, 88, 0, 'Cargo van verified. All systems normal.');
