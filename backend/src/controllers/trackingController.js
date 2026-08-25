const db = require('../config/db');

async function getLiveTracking(req, res, next) {
  try {
    const orgId = req.organizationId;

    // Fetch active vehicles with assigned driver info
    const vehicles = await db('vehicles')
      .leftJoin('drivers', 'vehicles.assigned_driver_id', 'drivers.id')
      .select(
        'vehicles.id',
        'vehicles.vehicle_number',
        'vehicles.registration_number',
        'vehicles.vehicle_type',
        'vehicles.model',
        'vehicles.status',
        'vehicles.current_lat',
        'vehicles.current_lng',
        'vehicles.last_updated',
        'vehicles.total_distance',
        'drivers.name as driver_name',
        'drivers.phone as driver_phone'
      )
      .where('vehicles.organization_id', orgId);

    // Fetch active trips (In Progress)
    const activeTrips = await db('trips')
      .join('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .join('drivers', 'trips.driver_id', 'drivers.id')
      .select(
        'trips.id',
        'trips.trip_number',
        'trips.vehicle_id',
        'trips.driver_id',
        'trips.origin_name',
        'trips.origin_lat',
        'trips.origin_lng',
        'trips.destination_name',
        'trips.destination_lat',
        'trips.destination_lng',
        'trips.scheduled_start',
        'trips.scheduled_end',
        'trips.actual_start',
        'trips.route_waypoints',
        'trips.status',
        'trips.distance_km',
        'vehicles.vehicle_number',
        'drivers.name as driver_name'
      )
      .where('trips.organization_id', orgId)
      .andWhere('trips.status', 'In Progress');

    const formattedTrips = activeTrips.map(trip => {
      let waypoints = [];
      if (trip.route_waypoints) {
        try {
          waypoints = typeof trip.route_waypoints === 'string' ? JSON.parse(trip.route_waypoints) : trip.route_waypoints;
        } catch (e) {
          waypoints = [];
        }
      }
      return { ...trip, route_waypoints: waypoints };
    });

    // Fetch active geofences
    const geofences = await db('geofences')
      .where('organization_id', orgId)
      .andWhere('is_active', 1);

    // Fetch recent geofence events (last 20)
    const recentEvents = await db('geofence_events')
      .join('geofences', 'geofence_events.geofence_id', 'geofences.id')
      .join('vehicles', 'geofence_events.vehicle_id', 'vehicles.id')
      .select(
        'geofence_events.*',
        'geofences.name as geofence_name',
        'vehicles.vehicle_number'
      )
      .where('geofence_events.organization_id', orgId)
      .orderBy('geofence_events.timestamp', 'desc')
      .limit(20);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      vehicles,
      activeTrips: formattedTrips,
      geofences,
      recentEvents
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLiveTracking
};
