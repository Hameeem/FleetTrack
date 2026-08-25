const Joi = require('joi');
const db = require('../config/db');

const tripSchema = Joi.object({
  driver_id: Joi.number().required(),
  vehicle_id: Joi.number().required(),
  origin_name: Joi.string().required(),
  origin_lat: Joi.number().required(),
  origin_lng: Joi.number().required(),
  destination_name: Joi.string().required(),
  destination_lat: Joi.number().required(),
  destination_lng: Joi.number().required(),
  scheduled_start: Joi.string().required(),
  scheduled_end: Joi.string().required(),
  route_waypoints: Joi.array().items(Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() })).optional().default([]),
  distance_km: Joi.number().optional().default(15.0),
  notes: Joi.string().optional().allow('')
});

async function getTrips(req, res, next) {
  try {
    const { status, driver_id, vehicle_id, date, search } = req.query;

    let query = db('trips')
      .join('drivers', 'trips.driver_id', 'drivers.id')
      .join('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .select(
        'trips.*',
        'drivers.name as driver_name',
        'drivers.phone as driver_phone',
        'vehicles.vehicle_number',
        'vehicles.model as vehicle_model',
        'vehicles.vehicle_type'
      )
      .where('trips.organization_id', req.organizationId);

    // If driver role, limit to driver's own trips
    if (req.user.role === 'Driver') {
      const driverRecord = await db('drivers').where('user_id', req.user.id).first();
      if (driverRecord) {
        query = query.where('trips.driver_id', driverRecord.id);
      } else {
        query = query.where('trips.driver_id', -1);
      }
    } else if (driver_id) {
      query = query.where('trips.driver_id', driver_id);
    }

    if (vehicle_id) {
      query = query.where('trips.vehicle_id', vehicle_id);
    }

    if (status) {
      query = query.where('trips.status', status);
    }

    if (date) {
      query = query.andWhere('trips.scheduled_start', 'like', `${date}%`);
    }

    if (search) {
      query = query.andWhere(b => {
        b.where('trips.trip_number', 'like', `%${search}%`)
          .orWhere('trips.origin_name', 'like', `%${search}%`)
          .orWhere('trips.destination_name', 'like', `%${search}%`)
          .orWhere('drivers.name', 'like', `%${search}%`)
          .orWhere('vehicles.vehicle_number', 'like', `%${search}%`);
      });
    }

    const rawTrips = await query.orderBy('trips.scheduled_start', 'desc');

    const trips = rawTrips.map(t => {
      let waypoints = [];
      if (t.route_waypoints) {
        try {
          waypoints = typeof t.route_waypoints === 'string' ? JSON.parse(t.route_waypoints) : t.route_waypoints;
        } catch (e) {
          waypoints = [];
        }
      }
      return { ...t, route_waypoints: waypoints };
    });

    return res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
}

async function getTripById(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await db('trips')
      .join('drivers', 'trips.driver_id', 'drivers.id')
      .join('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .select(
        'trips.*',
        'drivers.name as driver_name',
        'drivers.email as driver_email',
        'drivers.phone as driver_phone',
        'vehicles.vehicle_number',
        'vehicles.model as vehicle_model',
        'vehicles.current_lat as vehicle_lat',
        'vehicles.current_lng as vehicle_lng'
      )
      .where('trips.id', id)
      .andWhere('trips.organization_id', req.organizationId)
      .first();

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    // Driver restriction check
    if (req.user.role === 'Driver') {
      const driverRecord = await db('drivers').where('user_id', req.user.id).first();
      if (!driverRecord || trip.driver_id !== driverRecord.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You can only view your own assigned trips.' });
      }
    }

    let waypoints = [];
    if (trip.route_waypoints) {
      try {
        waypoints = typeof trip.route_waypoints === 'string' ? JSON.parse(trip.route_waypoints) : trip.route_waypoints;
      } catch (e) {
        waypoints = [];
      }
    }

    // Fetch trip location history points
    const locations = await db('trip_locations')
      .where('trip_id', id)
      .orderBy('timestamp', 'asc');

    return res.json({
      success: true,
      trip: { ...trip, route_waypoints: waypoints, location_history: locations }
    });
  } catch (error) {
    next(error);
  }
}

async function createTrip(req, res, next) {
  try {
    const {
      driver_id,
      vehicle_id,
      origin_name,
      origin_lat,
      origin_lng,
      destination_name,
      destination_lat,
      destination_lng,
      scheduled_start,
      scheduled_end,
      route_waypoints,
      distance_km,
      notes
    } = req.body;

    // Verify driver and vehicle belong to organization
    const driver = await db('drivers').where('id', driver_id).andWhere('organization_id', req.organizationId).first();
    const vehicle = await db('vehicles').where('id', vehicle_id).andWhere('organization_id', req.organizationId).first();

    if (!driver || !vehicle) {
      return res.status(400).json({ success: false, message: 'Invalid driver or vehicle specified for your organization.' });
    }

    const trip_number = `TRIP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build default route waypoints if empty
    let waypoints = route_waypoints || [];
    if (waypoints.length === 0) {
      const midLat = (Number(origin_lat) + Number(destination_lat)) / 2;
      const midLng = (Number(origin_lng) + Number(destination_lng)) / 2;
      waypoints = [
        { lat: Number(origin_lat), lng: Number(origin_lng) },
        { lat: midLat + 0.005, lng: midLng - 0.005 },
        { lat: Number(destination_lat), lng: Number(destination_lng) }
      ];
    }

    const [id] = await db('trips').insert({
      organization_id: req.organizationId,
      trip_number,
      driver_id,
      vehicle_id,
      origin_name,
      origin_lat,
      origin_lng,
      destination_name,
      destination_lat,
      destination_lng,
      scheduled_start,
      scheduled_end,
      route_waypoints: JSON.stringify(waypoints),
      status: 'Assigned',
      distance_km: distance_km || 15.0,
      notes
    });

    const newTrip = await db('trips').where('id', id).first();
    return res.status(201).json({ success: true, message: 'Trip created and assigned successfully.', trip: newTrip });
  } catch (error) {
    next(error);
  }
}

async function updateTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await db('trips').where('id', id).andWhere('organization_id', req.organizationId).first();

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const updateData = { ...req.body, updated_at: db.fn.now() };
    if (updateData.route_waypoints && typeof updateData.route_waypoints === 'object') {
      updateData.route_waypoints = JSON.stringify(updateData.route_waypoints);
    }

    await db('trips').where('id', id).andWhere('organization_id', req.organizationId).update(updateData);
    const updatedTrip = await db('trips').where('id', id).first();

    return res.json({ success: true, message: 'Trip updated successfully.', trip: updatedTrip });
  } catch (error) {
    next(error);
  }
}

async function startTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await db('trips').where('id', id).andWhere('organization_id', req.organizationId).first();

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    // Driver authorization check
    if (req.user.role === 'Driver') {
      const driverRecord = await db('drivers').where('user_id', req.user.id).first();
      if (!driverRecord || trip.driver_id !== driverRecord.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You can only start trips assigned to you.' });
      }
    }

    await db('trips').where('id', id).update({
      status: 'In Progress',
      actual_start: db.fn.now(),
      updated_at: db.fn.now()
    });

    // Update vehicle and driver status & location to trip origin
    await db('vehicles').where('id', trip.vehicle_id).update({
      status: 'On Trip',
      current_lat: trip.origin_lat,
      current_lng: trip.origin_lng,
      last_updated: db.fn.now()
    });

    await db('drivers').where('id', trip.driver_id).update({
      status: 'On Trip'
    });

    return res.json({ success: true, message: 'Trip started successfully. Vehicle simulation initiated.' });
  } catch (error) {
    next(error);
  }
}

async function completeTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await db('trips').where('id', id).andWhere('organization_id', req.organizationId).first();

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    // Driver authorization check
    if (req.user.role === 'Driver') {
      const driverRecord = await db('drivers').where('user_id', req.user.id).first();
      if (!driverRecord || trip.driver_id !== driverRecord.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You can only complete trips assigned to you.' });
      }
    }

    await db('trips').where('id', id).update({
      status: 'Completed',
      actual_end: db.fn.now(),
      updated_at: db.fn.now()
    });

    // Update vehicle location to destination & update status
    await db('vehicles').where('id', trip.vehicle_id).update({
      status: 'Available',
      current_lat: trip.destination_lat,
      current_lng: trip.destination_lng,
      total_distance: db.raw('total_distance + ?', [trip.distance_km || 15]),
      last_updated: db.fn.now()
    });

    await db('drivers').where('id', trip.driver_id).update({
      status: 'Active'
    });

    return res.json({ success: true, message: 'Trip completed successfully.' });
  } catch (error) {
    next(error);
  }
}

async function cancelTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await db('trips').where('id', id).andWhere('organization_id', req.organizationId).first();

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    await db('trips').where('id', id).update({
      status: 'Cancelled',
      updated_at: db.fn.now()
    });

    await db('vehicles').where('id', trip.vehicle_id).update({ status: 'Available' });
    await db('drivers').where('id', trip.driver_id).update({ status: 'Active' });

    return res.json({ success: true, message: 'Trip cancelled.' });
  } catch (error) {
    next(error);
  }
}

async function deleteTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await db('trips').where('id', id).andWhere('organization_id', req.organizationId).first();

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    await db('trips').where('id', id).andWhere('organization_id', req.organizationId).delete();
    return res.json({ success: true, message: 'Trip deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
  tripSchema
};
