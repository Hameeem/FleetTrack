// Multi-Tenant Mock Data & Fallback Service for Live Demo / GitHub Pages

export const mockUsers = [
  { id: 1, name: 'Sarah Jenkins (Admin)', email: 'admin@apexlogistics.com', role: 'Admin', organization_id: 1, organization_name: 'Apex Logistics Inc.', employee_id: 'EMP-APEX-001' },
  { id: 2, name: 'Marcus Vance (Manager)', email: 'manager@apexlogistics.com', role: 'Manager', organization_id: 1, organization_name: 'Apex Logistics Inc.', employee_id: 'EMP-APEX-002' },
  { id: 3, name: 'John Miller (Driver)', email: 'john.miller@apexlogistics.com', role: 'Driver', organization_id: 1, organization_name: 'Apex Logistics Inc.', employee_id: 'EMP-APEX-003' },
  { id: 4, name: 'Elena Rostova (Driver)', email: 'elena.r@apexlogistics.com', role: 'Driver', organization_id: 1, organization_name: 'Apex Logistics Inc.', employee_id: 'EMP-APEX-004' },
  { id: 5, name: 'David Chen (Admin)', email: 'admin@globalexpress.com', role: 'Admin', organization_id: 2, organization_name: 'Global Express Delivery', employee_id: 'EMP-GLOB-001' },
  { id: 6, name: 'Rachel Adams (Manager)', email: 'manager@globalexpress.com', role: 'Manager', organization_id: 2, organization_name: 'Global Express Delivery', employee_id: 'EMP-GLOB-002' },
  { id: 7, name: 'Carlos Santana (Driver)', email: 'carlos.s@globalexpress.com', role: 'Driver', organization_id: 2, organization_name: 'Global Express Delivery', employee_id: 'EMP-GLOB-003' }
];

export const mockDrivers = [
  { id: 1, organization_id: 1, name: 'John Miller', email: 'john.miller@apexlogistics.com', phone: '+1-555-0192', employee_id: 'EMP-APEX-003', license_number: 'DL-CA-987654', license_expiry: '2028-05-15', status: 'Active', assigned_vehicle_id: 1, assigned_vehicle_number: 'TRK-101', assigned_vehicle_model: 'Volvo FH16 (2023)' },
  { id: 2, organization_id: 1, name: 'Elena Rostova', email: 'elena.r@apexlogistics.com', phone: '+1-555-0193', employee_id: 'EMP-APEX-004', license_number: 'DL-CA-456789', license_expiry: '2027-11-20', status: 'On Trip', assigned_vehicle_id: 2, assigned_vehicle_number: 'VAN-202', assigned_vehicle_model: 'Ford Transit 350' },
  { id: 3, organization_id: 1, name: 'Robert Thorne', email: 'robert.t@apexlogistics.com', phone: '+1-555-0194', employee_id: 'EMP-APEX-005', license_number: 'DL-CA-112233', license_expiry: '2026-09-30', status: 'Active', assigned_vehicle_id: 4, assigned_vehicle_number: 'EV-301', assigned_vehicle_model: 'Rivian EDV 700' },
  { id: 4, organization_id: 2, name: 'Carlos Santana', email: 'carlos.s@globalexpress.com', phone: '+1-555-0881', employee_id: 'EMP-GLOB-003', license_number: 'DL-NY-554433', license_expiry: '2027-04-10', status: 'Active', assigned_vehicle_id: 5, assigned_vehicle_number: 'GLOB-VAN-01', assigned_vehicle_model: 'Mercedes Sprinter' },
  { id: 5, organization_id: 2, name: 'Michael Chang', email: 'michael.c@globalexpress.com', phone: '+1-555-0882', employee_id: 'EMP-GLOB-004', license_number: 'DL-NY-998877', license_expiry: '2028-12-01', status: 'Off Duty', assigned_vehicle_id: 6, assigned_vehicle_number: 'GLOB-TRK-02', assigned_vehicle_model: 'Isuzu N-Series' }
];

export const mockVehicles = [
  { id: 1, organization_id: 1, vehicle_number: 'TRK-101', registration_number: 'REG-APEX-901', vehicle_type: 'Heavy Duty Truck', model: 'Volvo FH16 (2023)', status: 'Available', current_lat: 37.774929, current_lng: -122.419418, total_distance: 14250.50, assigned_driver_id: 1, assigned_driver_name: 'John Miller' },
  { id: 2, organization_id: 1, vehicle_number: 'VAN-202', registration_number: 'REG-APEX-902', vehicle_type: 'Cargo Van', model: 'Ford Transit 350', status: 'On Trip', current_lat: 37.783300, current_lng: -122.416700, total_distance: 8920.00, assigned_driver_id: 2, assigned_driver_name: 'Elena Rostova' },
  { id: 3, organization_id: 1, vehicle_number: 'TRK-103', registration_number: 'REG-APEX-903', vehicle_type: 'Freight Semi-Truck', model: 'Freightliner Cascadia', status: 'Maintenance', current_lat: 37.765000, current_lng: -122.430000, total_distance: 31400.75, assigned_driver_id: null, assigned_driver_name: null },
  { id: 4, organization_id: 1, vehicle_number: 'EV-301', registration_number: 'REG-APEX-904', vehicle_type: 'Electric Cargo', model: 'Rivian EDV 700', status: 'Available', current_lat: 37.790000, current_lng: -122.400000, total_distance: 4200.30, assigned_driver_id: 3, assigned_driver_name: 'Robert Thorne' },
  { id: 5, organization_id: 2, vehicle_number: 'GLOB-VAN-01', registration_number: 'REG-GLOB-101', vehicle_type: 'Delivery Van', model: 'Mercedes Sprinter', status: 'On Trip', current_lat: 40.712776, current_lng: -74.005974, total_distance: 19500.00, assigned_driver_id: 4, assigned_driver_name: 'Carlos Santana' },
  { id: 6, organization_id: 2, vehicle_number: 'GLOB-TRK-02', registration_number: 'REG-GLOB-102', vehicle_type: 'Flatbed Truck', model: 'Isuzu N-Series', status: 'Available', current_lat: 40.730610, current_lng: -73.935242, total_distance: 27800.25, assigned_driver_id: 5, assigned_driver_name: 'Michael Chang' }
];

export const mockGeofences = [
  { id: 1, organization_id: 1, name: 'SF Main Hub & Warehouse', center_lat: 37.774929, center_lng: -122.419418, radius_meters: 800, is_active: 1 },
  { id: 2, organization_id: 1, name: 'Port of Oakland Terminal', center_lat: 37.804363, center_lng: -122.271111, radius_meters: 1200, is_active: 1 },
  { id: 3, organization_id: 1, name: 'SFO Logistics Yard', center_lat: 37.621313, center_lng: -122.378955, radius_meters: 1000, is_active: 1 },
  { id: 4, organization_id: 2, name: 'JFK Cargo Depot', center_lat: 40.641311, center_lng: -73.778137, radius_meters: 1500, is_active: 1 },
  { id: 5, organization_id: 2, name: 'Manhattan Express Center', center_lat: 40.758896, center_lng: -73.985130, radius_meters: 600, is_active: 1 }
];

export const mockTrips = [
  {
    id: 1,
    organization_id: 1,
    trip_number: 'TRIP-2026-001',
    driver_id: 2,
    driver_name: 'Elena Rostova',
    vehicle_id: 2,
    vehicle_number: 'VAN-202',
    origin_name: 'SF Main Hub & Warehouse',
    origin_lat: 37.774929,
    origin_lng: -122.419418,
    destination_name: 'Port of Oakland Terminal',
    destination_lat: 37.804363,
    destination_lng: -122.271111,
    scheduled_start: '2026-08-26T10:00:00.000Z',
    scheduled_end: '2026-08-26T12:30:00.000Z',
    actual_start: '2026-08-26T10:05:00.000Z',
    status: 'In Progress',
    distance_km: 18.50,
    notes: 'Priority electronics shipment',
    route_waypoints: [
      { lat: 37.774929, lng: -122.419418 },
      { lat: 37.785, lng: -122.395 },
      { lat: 37.804363, lng: -122.271111 }
    ]
  },
  {
    id: 2,
    organization_id: 1,
    trip_number: 'TRIP-2026-002',
    driver_id: 1,
    driver_name: 'John Miller',
    vehicle_id: 1,
    vehicle_number: 'TRK-101',
    origin_name: 'SF Main Hub & Warehouse',
    origin_lat: 37.774929,
    origin_lng: -122.419418,
    destination_name: 'SFO Logistics Yard',
    destination_lat: 37.621313,
    destination_lng: -122.378955,
    scheduled_start: '2026-08-26T14:00:00.000Z',
    scheduled_end: '2026-08-26T16:00:00.000Z',
    status: 'Assigned',
    distance_km: 22.10,
    notes: 'Automotive spare parts transfer',
    route_waypoints: [
      { lat: 37.774929, lng: -122.419418 },
      { lat: 37.621313, lng: -122.378955 }
    ]
  },
  {
    id: 3,
    organization_id: 1,
    trip_number: 'TRIP-2026-003',
    driver_id: 3,
    driver_name: 'Robert Thorne',
    vehicle_id: 4,
    vehicle_number: 'EV-301',
    origin_name: 'SFO Logistics Yard',
    origin_lat: 37.621313,
    origin_lng: -122.378955,
    destination_name: 'SF Main Hub & Warehouse',
    destination_lat: 37.774929,
    destination_lng: -122.419418,
    scheduled_start: '2026-08-25T08:00:00.000Z',
    scheduled_end: '2026-08-25T10:00:00.000Z',
    actual_start: '2026-08-25T08:02:00.000Z',
    actual_end: '2026-08-25T09:55:00.000Z',
    status: 'Completed',
    distance_km: 21.80,
    notes: 'Scheduled return shipment completed cleanly',
    route_waypoints: [
      { lat: 37.621313, lng: -122.378955 },
      { lat: 37.774929, lng: -122.419418 }
    ]
  },
  {
    id: 4,
    organization_id: 2,
    trip_number: 'TRIP-GLOB-901',
    driver_id: 4,
    driver_name: 'Carlos Santana',
    vehicle_id: 5,
    vehicle_number: 'GLOB-VAN-01',
    origin_name: 'JFK Cargo Depot',
    origin_lat: 40.641311,
    origin_lng: -73.778137,
    destination_name: 'Manhattan Express Center',
    destination_lat: 40.758896,
    destination_lng: -73.985130,
    scheduled_start: '2026-08-26T11:00:00.000Z',
    scheduled_end: '2026-08-26T13:00:00.000Z',
    actual_start: '2026-08-26T11:15:00.000Z',
    status: 'In Progress',
    distance_km: 25.40,
    notes: 'Medical supply express delivery',
    route_waypoints: [
      { lat: 40.641311, lng: -73.778137 },
      { lat: 40.758896, lng: -73.985130 }
    ]
  }
];

export const mockIncidents = [
  { id: 1, organization_id: 1, driver_name: 'Elena Rostova', vehicle_number: 'VAN-202', vehicle_model: 'Ford Transit 350', incident_type: 'Traffic Congestion Delay', description: 'Heavy congestion on Bay Bridge causing 20 min estimated delay.', location_name: 'I-80 East Bridge Toll', severity: 'Low', created_at: new Date().toISOString() },
  { id: 2, organization_id: 1, driver_name: 'John Miller', vehicle_number: 'TRK-103', vehicle_model: 'Freightliner Cascadia', incident_type: 'Engine Warning Light', description: 'Check engine light triggered during pre-trip inspection.', location_name: 'SF Hub Maintenance Bay', severity: 'Medium', created_at: new Date().toISOString() }
];

export const mockInspections = [
  { id: 1, organization_id: 1, driver_name: 'Elena Rostova', vehicle_number: 'VAN-202', brakes_passed: true, tires_passed: true, lights_passed: true, fuel_level: 95, damage_reported: false, notes: 'Pre-trip checklist cleared.', created_at: new Date().toISOString() },
  { id: 2, organization_id: 1, driver_name: 'John Miller', vehicle_number: 'TRK-101', brakes_passed: true, tires_passed: true, lights_passed: true, fuel_level: 80, damage_reported: false, notes: 'Morning routine inspection completed.', created_at: new Date().toISOString() }
];

export const mockGeofenceEvents = [
  { id: 1, organization_id: 1, geofence_name: 'SF Main Hub & Warehouse', vehicle_number: 'VAN-202', vehicle_model: 'Ford Transit 350', event_type: 'EXIT', message: 'Vehicle VAN-202 exited SF Main Hub & Warehouse zone (Simulated GPS)', timestamp: new Date().toISOString() },
  { id: 2, organization_id: 1, geofence_name: 'SFO Logistics Yard', vehicle_number: 'EV-301', vehicle_model: 'Rivian EDV 700', event_type: 'ENTER', message: 'Vehicle EV-301 entered SFO Logistics Yard zone (Simulated GPS)', timestamp: new Date(Date.now() - 3600000).toISOString() }
];
