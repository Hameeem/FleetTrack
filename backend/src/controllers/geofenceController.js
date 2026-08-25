const Joi = require('joi');
const db = require('../config/db');

const geofenceSchema = Joi.object({
  name: Joi.string().required(),
  center_lat: Joi.number().min(-90).max(90).required(),
  center_lng: Joi.number().min(-180).max(180).required(),
  radius_meters: Joi.number().min(50).max(50000).default(500),
  is_active: Joi.boolean().default(true)
});

async function getGeofences(req, res, next) {
  try {
    const geofences = await db('geofences')
      .where('organization_id', req.organizationId)
      .orderBy('created_at', 'desc');

    return res.json({ success: true, count: geofences.length, geofences });
  } catch (error) {
    next(error);
  }
}

async function createGeofence(req, res, next) {
  try {
    const { name, center_lat, center_lng, radius_meters, is_active } = req.body;

    const [id] = await db('geofences').insert({
      organization_id: req.organizationId,
      name,
      center_lat,
      center_lng,
      radius_meters: radius_meters || 500,
      is_active: is_active !== undefined ? is_active : 1
    });

    const newGeofence = await db('geofences').where('id', id).first();
    return res.status(201).json({ success: true, message: 'Geofence created successfully.', geofence: newGeofence });
  } catch (error) {
    next(error);
  }
}

async function deleteGeofence(req, res, next) {
  try {
    const { id } = req.params;
    const geofence = await db('geofences')
      .where('id', id)
      .andWhere('organization_id', req.organizationId)
      .first();

    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence zone not found.' });
    }

    await db('geofences').where('id', id).andWhere('organization_id', req.organizationId).delete();
    return res.json({ success: true, message: 'Geofence zone deleted.' });
  } catch (error) {
    next(error);
  }
}

async function getGeofenceEvents(req, res, next) {
  try {
    const events = await db('geofence_events')
      .join('geofences', 'geofence_events.geofence_id', 'geofences.id')
      .join('vehicles', 'geofence_events.vehicle_id', 'vehicles.id')
      .select(
        'geofence_events.*',
        'geofences.name as geofence_name',
        'vehicles.vehicle_number',
        'vehicles.model as vehicle_model'
      )
      .where('geofence_events.organization_id', req.organizationId)
      .orderBy('geofence_events.timestamp', 'desc')
      .limit(50);

    return res.json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGeofences,
  createGeofence,
  deleteGeofence,
  getGeofenceEvents,
  geofenceSchema
};
