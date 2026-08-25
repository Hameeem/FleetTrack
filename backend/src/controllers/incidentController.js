const Joi = require('joi');
const db = require('../config/db');

const incidentSchema = Joi.object({
  driver_id: Joi.number().optional(),
  vehicle_id: Joi.number().required(),
  trip_id: Joi.number().optional().allow(null),
  incident_type: Joi.string().required(),
  description: Joi.string().required(),
  location_name: Joi.string().required(),
  severity: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium')
});

const inspectionSchema = Joi.object({
  driver_id: Joi.number().optional(),
  vehicle_id: Joi.number().required(),
  brakes_passed: Joi.boolean().default(true),
  tires_passed: Joi.boolean().default(true),
  lights_passed: Joi.boolean().default(true),
  fuel_level: Joi.number().min(0).max(100).default(100),
  damage_reported: Joi.boolean().default(false),
  notes: Joi.string().optional().allow('')
});

async function getIncidents(req, res, next) {
  try {
    const incidents = await db('incidents')
      .join('drivers', 'incidents.driver_id', 'drivers.id')
      .join('vehicles', 'incidents.vehicle_id', 'vehicles.id')
      .leftJoin('trips', 'incidents.trip_id', 'trips.id')
      .select(
        'incidents.*',
        'drivers.name as driver_name',
        'vehicles.vehicle_number',
        'vehicles.model as vehicle_model',
        'trips.trip_number'
      )
      .where('incidents.organization_id', req.organizationId)
      .orderBy('incidents.created_at', 'desc');

    return res.json({ success: true, count: incidents.length, incidents });
  } catch (error) {
    next(error);
  }
}

async function createIncident(req, res, next) {
  try {
    let { driver_id, vehicle_id, trip_id, incident_type, description, location_name, severity } = req.body;

    // If submitted by Driver role, resolve driver_id from logged-in user
    if (req.user.role === 'Driver') {
      const driverRecord = await db('drivers').where('user_id', req.user.id).first();
      if (driverRecord) {
        driver_id = driverRecord.id;
      }
    }

    if (!driver_id) {
      const firstDriver = await db('drivers').where('organization_id', req.organizationId).first();
      if (!firstDriver) {
        return res.status(400).json({ success: false, message: 'No registered driver associated with this incident.' });
      }
      driver_id = firstDriver.id;
    }

    const [id] = await db('incidents').insert({
      organization_id: req.organizationId,
      driver_id,
      vehicle_id,
      trip_id: trip_id || null,
      incident_type,
      description,
      location_name,
      severity: severity || 'Medium',
      status: 'Pending'
    });

    const newIncident = await db('incidents').where('id', id).first();
    return res.status(201).json({ success: true, message: 'Incident report submitted successfully.', incident: newIncident });
  } catch (error) {
    next(error);
  }
}

async function getInspections(req, res, next) {
  try {
    const inspections = await db('vehicle_inspections')
      .join('drivers', 'vehicle_inspections.driver_id', 'drivers.id')
      .join('vehicles', 'vehicle_inspections.vehicle_id', 'vehicles.id')
      .select(
        'vehicle_inspections.*',
        'drivers.name as driver_name',
        'vehicles.vehicle_number',
        'vehicles.model as vehicle_model'
      )
      .where('vehicle_inspections.organization_id', req.organizationId)
      .orderBy('vehicle_inspections.created_at', 'desc');

    return res.json({ success: true, count: inspections.length, inspections });
  } catch (error) {
    next(error);
  }
}

async function createInspection(req, res, next) {
  try {
    let { driver_id, vehicle_id, brakes_passed, tires_passed, lights_passed, fuel_level, damage_reported, notes } = req.body;

    if (req.user.role === 'Driver') {
      const driverRecord = await db('drivers').where('user_id', req.user.id).first();
      if (driverRecord) {
        driver_id = driverRecord.id;
      }
    }

    if (!driver_id) {
      const firstDriver = await db('drivers').where('organization_id', req.organizationId).first();
      if (!firstDriver) {
        return res.status(400).json({ success: false, message: 'No driver associated with this inspection.' });
      }
      driver_id = firstDriver.id;
    }

    const [id] = await db('vehicle_inspections').insert({
      organization_id: req.organizationId,
      driver_id,
      vehicle_id,
      brakes_passed: brakes_passed !== undefined ? (brakes_passed ? 1 : 0) : 1,
      tires_passed: tires_passed !== undefined ? (tires_passed ? 1 : 0) : 1,
      lights_passed: lights_passed !== undefined ? (lights_passed ? 1 : 0) : 1,
      fuel_level: fuel_level !== undefined ? fuel_level : 100,
      damage_reported: damage_reported !== undefined ? (damage_reported ? 1 : 0) : 0,
      notes
    });

    const newInspection = await db('vehicle_inspections').where('id', id).first();
    return res.status(201).json({ success: true, message: 'Vehicle inspection report saved.', inspection: newInspection });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getIncidents,
  createIncident,
  getInspections,
  createInspection,
  incidentSchema,
  inspectionSchema
};
