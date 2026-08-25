const db = require('../config/db');
const logger = require('../utils/logger');

// Haversine formula to compute distance in meters between two lat/lng points
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Memory cache to track vehicle geofence state: { "vehicleId_geofenceId": boolean (isInside) }
const geofenceState = new Map();

// Simulation step tracker for active trips: { tripId: { currentStep: number, totalSteps: number } }
const tripProgressMap = new Map();

async function runSimulationStep(io) {
  try {
    // 1. Fetch all active "In Progress" trips
    const activeTrips = await db('trips')
      .join('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .select(
        'trips.id as trip_id',
        'trips.organization_id',
        'trips.trip_number',
        'trips.driver_id',
        'trips.vehicle_id',
        'trips.origin_lat',
        'trips.origin_lng',
        'trips.destination_lat',
        'trips.destination_lng',
        'trips.route_waypoints',
        'vehicles.vehicle_number',
        'vehicles.current_lat',
        'vehicles.current_lng',
        'vehicles.total_distance'
      )
      .where('trips.status', 'In Progress');

    if (activeTrips.length === 0) {
      return;
    }

    for (const trip of activeTrips) {
      let waypoints = [];
      try {
        waypoints = typeof trip.route_waypoints === 'string' ? JSON.parse(trip.route_waypoints) : (trip.route_waypoints || []);
      } catch (e) {
        waypoints = [];
      }

      if (waypoints.length === 0) {
        waypoints = [
          { lat: Number(trip.origin_lat), lng: Number(trip.origin_lng) },
          { lat: Number(trip.destination_lat), lng: Number(trip.destination_lng) }
        ];
      }

      // Initialize or retrieve trip progress
      let progress = tripProgressMap.get(trip.trip_id);
      if (!progress) {
        progress = { currentStep: 0, totalSteps: 40 }; // 40 steps from origin to destination
        tripProgressMap.set(trip.trip_id, progress);
      }

      progress.currentStep = (progress.currentStep + 1) % (progress.totalSteps + 1);

      // Interpolate current position along waypoints
      const t = progress.currentStep / progress.totalSteps;
      const targetWaypointIndex = Math.min(
        Math.floor(t * (waypoints.length - 1)),
        waypoints.length - 2
      );

      const p1 = waypoints[targetWaypointIndex] || waypoints[0];
      const p2 = waypoints[targetWaypointIndex + 1] || waypoints[waypoints.length - 1];

      const localT = (t * (waypoints.length - 1)) - targetWaypointIndex;
      const nextLat = p1.lat + (p2.lat - p1.lat) * localT;
      const nextLng = p1.lng + (p2.lng - p1.lng) * localT;

      const deltaDistanceKm = 0.05; // 50 meters per simulation step
      const simulatedSpeedKmh = Math.floor(45 + Math.random() * 20); // 45-65 km/h

      // Update vehicle in database
      await db('vehicles')
        .where('id', trip.vehicle_id)
        .update({
          current_lat: nextLat,
          current_lng: nextLng,
          total_distance: Number(trip.total_distance || 0) + deltaDistanceKm,
          last_updated: db.fn.now()
        });

      // Record location history
      await db('trip_locations').insert({
        trip_id: trip.trip_id,
        vehicle_id: trip.vehicle_id,
        lat: nextLat,
        lng: nextLng,
        speed: simulatedSpeedKmh,
        timestamp: db.fn.now()
      });

      // Evaluate Geofences for this vehicle's organization
      const geofences = await db('geofences')
        .where('organization_id', trip.organization_id)
        .andWhere('is_active', 1);

      for (const geofence of geofences) {
        const distMeters = calculateDistanceMeters(
          nextLat,
          nextLng,
          Number(geofence.center_lat),
          Number(geofence.center_lng)
        );

        const stateKey = `${trip.vehicle_id}_${geofence.id}`;
        const wasInside = geofenceState.get(stateKey) || false;
        const isInside = distMeters <= geofence.radius_meters;

        if (!wasInside && isInside) {
          // ENTER event
          geofenceState.set(stateKey, true);
          const message = `Vehicle ${trip.vehicle_number} entered ${geofence.name} (Simulated GPS)`;
          await db('geofence_events').insert({
            organization_id: trip.organization_id,
            geofence_id: geofence.id,
            vehicle_id: trip.vehicle_id,
            trip_id: trip.trip_id,
            event_type: 'ENTER',
            message,
            timestamp: db.fn.now()
          });

          if (io) {
            io.emit('geofence_alert', {
              organization_id: trip.organization_id,
              geofence_id: geofence.id,
              vehicle_id: trip.vehicle_id,
              event_type: 'ENTER',
              message,
              timestamp: new Date().toISOString()
            });
          }
          logger.info(`[Geofence ENTER] ${message}`);
        } else if (wasInside && !isInside) {
          // EXIT event
          geofenceState.set(stateKey, false);
          const message = `Vehicle ${trip.vehicle_number} exited ${geofence.name} (Simulated GPS)`;
          await db('geofence_events').insert({
            organization_id: trip.organization_id,
            geofence_id: geofence.id,
            vehicle_id: trip.vehicle_id,
            trip_id: trip.trip_id,
            event_type: 'EXIT',
            message,
            timestamp: db.fn.now()
          });

          if (io) {
            io.emit('geofence_alert', {
              organization_id: trip.organization_id,
              geofence_id: geofence.id,
              vehicle_id: trip.vehicle_id,
              event_type: 'EXIT',
              message,
              timestamp: new Date().toISOString()
            });
          }
          logger.info(`[Geofence EXIT] ${message}`);
        }
      }

      // Broadcast location update via WebSocket
      const locationUpdatePayload = {
        organization_id: trip.organization_id,
        trip_id: trip.trip_id,
        trip_number: trip.trip_number,
        vehicle_id: trip.vehicle_id,
        vehicle_number: trip.vehicle_number,
        lat: nextLat,
        lng: nextLng,
        speed: simulatedSpeedKmh,
        timestamp: new Date().toISOString(),
        isSimulated: true
      };

      if (io) {
        io.emit('vehicle_location', locationUpdatePayload);
      }
    }
  } catch (error) {
    logger.error(`[Simulation Engine Error] ${error.message}`);
  }
}

function startGPSSimulator(io, intervalMs = 3000) {
  logger.info(`[Simulation Engine] Started (Tick interval: ${intervalMs}ms)`);
  const timer = setInterval(() => {
    runSimulationStep(io);
  }, intervalMs);

  return () => clearInterval(timer);
}

module.exports = { startGPSSimulator, runSimulationStep };
