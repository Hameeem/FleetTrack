const Joi = require('joi');
const db = require('../config/db');

const vehicleSchema = Joi.object({
  vehicle_number: Joi.string().required(),
  registration_number: Joi.string().required(),
  vehicle_type: Joi.string().optional().default('Truck'),
  model: Joi.string().required(),
  status: Joi.string().valid('Available', 'On Trip', 'Maintenance', 'Deactivated').default('Available'),
  current_lat: Joi.number().min(-90).max(90).optional().default(37.774929),
  current_lng: Joi.number().min(-180).max(180).optional().default(-122.419418),
  total_distance: Joi.number().min(0).optional().default(0.00),
  assigned_driver_id: Joi.number().optional().allow(null)
});

async function getVehicles(req, res, next) {
  try {
    const { search, status, type } = req.query;

    let query = db('vehicles')
      .leftJoin('drivers', 'vehicles.assigned_driver_id', 'drivers.id')
      .select('vehicles.*', 'drivers.name as assigned_driver_name', 'drivers.email as assigned_driver_email')
      .where('vehicles.organization_id', req.organizationId);

    if (status) {
      query = query.where('vehicles.status', status);
    }

    if (type) {
      query = query.where('vehicles.vehicle_type', type);
    }

    if (search) {
      query = query.andWhere(builder => {
        builder.where('vehicles.vehicle_number', 'like', `%${search}%`)
          .orWhere('vehicles.registration_number', 'like', `%${search}%`)
          .orWhere('vehicles.model', 'like', `%${search}%`);
      });
    }

    const vehicles = await query.orderBy('vehicles.created_at', 'desc');
    return res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
}

async function getVehicleById(req, res, next) {
  try {
    const { id } = req.params;
    const vehicle = await db('vehicles')
      .leftJoin('drivers', 'vehicles.assigned_driver_id', 'drivers.id')
      .select('vehicles.*', 'drivers.name as assigned_driver_name', 'drivers.email as assigned_driver_email', 'drivers.phone as assigned_driver_phone')
      .where('vehicles.id', id)
      .andWhere('vehicles.organization_id', req.organizationId)
      .first();

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const trips = await db('trips')
      .leftJoin('drivers', 'trips.driver_id', 'drivers.id')
      .select('trips.*', 'drivers.name as driver_name')
      .where('trips.vehicle_id', id)
      .andWhere('trips.organization_id', req.organizationId)
      .orderBy('trips.scheduled_start', 'desc')
      .limit(10);

    return res.json({ success: true, vehicle: { ...vehicle, recent_trips: trips } });
  } catch (error) {
    next(error);
  }
}

async function createVehicle(req, res, next) {
  try {
    const { vehicle_number, registration_number, vehicle_type, model, status, current_lat, current_lng, total_distance, assigned_driver_id } = req.body;

    const existing = await db('vehicles')
      .where('organization_id', req.organizationId)
      .andWhere(b => b.where('vehicle_number', vehicle_number).orWhere('registration_number', registration_number))
      .first();

    if (existing) {
      return res.status(400).json({ success: false, message: 'A vehicle with this vehicle number or registration number already exists.' });
    }

    const [id] = await db('vehicles').insert({
      organization_id: req.organizationId,
      vehicle_number,
      registration_number,
      vehicle_type: vehicle_type || 'Truck',
      model,
      status: status || 'Available',
      current_lat: current_lat || 37.774929,
      current_lng: current_lng || -122.419418,
      total_distance: total_distance || 0.00,
      assigned_driver_id: assigned_driver_id || null,
      last_updated: db.fn.now()
    });

    if (assigned_driver_id) {
      await db('drivers')
        .where('id', assigned_driver_id)
        .andWhere('organization_id', req.organizationId)
        .update({ assigned_vehicle_id: id });
    }

    const newVehicle = await db('vehicles').where('id', id).first();
    return res.status(201).json({ success: true, message: 'Vehicle added successfully.', vehicle: newVehicle });
  } catch (error) {
    next(error);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const { id } = req.params;
    const { vehicle_number, registration_number, vehicle_type, model, status, current_lat, current_lng, total_distance, assigned_driver_id } = req.body;

    const vehicle = await db('vehicles')
      .where('id', id)
      .andWhere('organization_id', req.organizationId)
      .first();

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    await db('vehicles')
      .where('id', id)
      .andWhere('organization_id', req.organizationId)
      .update({
        vehicle_number: vehicle_number || vehicle.vehicle_number,
        registration_number: registration_number || vehicle.registration_number,
        vehicle_type: vehicle_type || vehicle.vehicle_type,
        model: model || vehicle.model,
        status: status || vehicle.status,
        current_lat: current_lat !== undefined ? current_lat : vehicle.current_lat,
        current_lng: current_lng !== undefined ? current_lng : vehicle.current_lng,
        total_distance: total_distance !== undefined ? total_distance : vehicle.total_distance,
        assigned_driver_id: assigned_driver_id !== undefined ? assigned_driver_id : vehicle.assigned_driver_id,
        last_updated: db.fn.now(),
        updated_at: db.fn.now()
      });

    if (assigned_driver_id !== undefined) {
      if (assigned_driver_id) {
        await db('drivers')
          .where('id', assigned_driver_id)
          .andWhere('organization_id', req.organizationId)
          .update({ assigned_vehicle_id: id });
      } else if (vehicle.assigned_driver_id) {
        await db('drivers')
          .where('id', vehicle.assigned_driver_id)
          .andWhere('organization_id', req.organizationId)
          .update({ assigned_vehicle_id: null });
      }
    }

    const updatedVehicle = await db('vehicles').where('id', id).first();
    return res.json({ success: true, message: 'Vehicle updated successfully.', vehicle: updatedVehicle });
  } catch (error) {
    next(error);
  }
}

async function deleteVehicle(req, res, next) {
  try {
    const { id } = req.params;
    const vehicle = await db('vehicles')
      .where('id', id)
      .andWhere('organization_id', req.organizationId)
      .first();

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    await db('drivers').where('assigned_vehicle_id', id).update({ assigned_vehicle_id: null });
    await db('vehicles').where('id', id).andWhere('organization_id', req.organizationId).delete();

    return res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function getVehicleTrips(req, res, next) {
  try {
    const { id } = req.params;
    const trips = await db('trips')
      .leftJoin('drivers', 'trips.driver_id', 'drivers.id')
      .select('trips.*', 'drivers.name as driver_name')
      .where('trips.vehicle_id', id)
      .andWhere('trips.organization_id', req.organizationId)
      .orderBy('trips.scheduled_start', 'desc');

    return res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleTrips,
  vehicleSchema
};
