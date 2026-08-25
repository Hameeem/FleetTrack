const Joi = require('joi');
const db = require('../config/db');

const driverSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(''),
  employee_id: Joi.string().required(),
  license_number: Joi.string().required(),
  license_expiry: Joi.string().required(),
  status: Joi.string().valid('Active', 'On Trip', 'Off Duty', 'Inactive').default('Active'),
  assigned_vehicle_id: Joi.number().optional().allow(null)
});

async function getDrivers(req, res, next) {
  try {
    const { search, status } = req.query;
    let query = db('drivers')
      .leftJoin('vehicles', 'drivers.assigned_vehicle_id', 'vehicles.id')
      .select('drivers.*', 'vehicles.vehicle_number as assigned_vehicle_number', 'vehicles.model as assigned_vehicle_model')
      .where('drivers.organization_id', req.organizationId);

    if (status) {
      query = query.where('drivers.status', status);
    }

    if (search) {
      query = query.andWhere(builder => {
        builder.where('drivers.name', 'like', `%${search}%`)
          .orWhere('drivers.email', 'like', `%${search}%`)
          .orWhere('drivers.employee_id', 'like', `%${search}%`)
          .orWhere('drivers.license_number', 'like', `%${search}%`);
      });
    }

    const drivers = await query.orderBy('drivers.created_at', 'desc');
    return res.json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    next(error);
  }
}

async function getDriverById(req, res, next) {
  try {
    const driver = await db('drivers')
      .leftJoin('vehicles', 'drivers.assigned_vehicle_id', 'vehicles.id')
      .select('drivers.*', 'vehicles.vehicle_number as assigned_vehicle_number', 'vehicles.model as assigned_vehicle_model')
      .where('drivers.id', req.params.id)
      .andWhere('drivers.organization_id', req.organizationId)
      .first();

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    // Also fetch trip statistics
    const tripsCount = await db('trips')
      .where('driver_id', driver.id)
      .andWhere('organization_id', req.organizationId)
      .count('id as count')
      .first();

    return res.json({
      success: true,
      driver: { ...driver, total_trips: tripsCount ? (tripsCount.count || tripsCount['count(*)'] || 0) : 0 }
    });
  } catch (error) {
    next(error);
  }
}

async function createDriver(req, res, next) {
  try {
    const { name, email, phone, employee_id, license_number, license_expiry, status, assigned_vehicle_id } = req.body;

    // Check duplicate employee_id or email in organization
    const existing = await db('drivers')
      .where('organization_id', req.organizationId)
      .andWhere(b => b.where('employee_id', employee_id).orWhere('email', email.toLowerCase()))
      .first();

    if (existing) {
      return res.status(400).json({ success: false, message: 'A driver with this email or employee ID already exists in your organization.' });
    }

    const [id] = await db('drivers').insert({
      organization_id: req.organizationId,
      name,
      email: email.toLowerCase(),
      phone,
      employee_id,
      license_number,
      license_expiry,
      status: status || 'Active',
      assigned_vehicle_id: assigned_vehicle_id || null
    });

    // If vehicle assigned, update vehicle assigned_driver_id
    if (assigned_vehicle_id) {
      await db('vehicles')
        .where('id', assigned_vehicle_id)
        .andWhere('organization_id', req.organizationId)
        .update({ assigned_driver_id: id });
    }

    const newDriver = await db('drivers').where('id', id).first();
    return res.status(201).json({ success: true, message: 'Driver created successfully.', driver: newDriver });
  } catch (error) {
    next(error);
  }
}

async function updateDriver(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, phone, employee_id, license_number, license_expiry, status, assigned_vehicle_id } = req.body;

    const driver = await db('drivers')
      .where('id', id)
      .andWhere('organization_id', req.organizationId)
      .first();

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    await db('drivers')
      .where('id', id)
      .andWhere('organization_id', req.organizationId)
      .update({
        name: name || driver.name,
        email: email ? email.toLowerCase() : driver.email,
        phone: phone !== undefined ? phone : driver.phone,
        employee_id: employee_id || driver.employee_id,
        license_number: license_number || driver.license_number,
        license_expiry: license_expiry || driver.license_expiry,
        status: status || driver.status,
        assigned_vehicle_id: assigned_vehicle_id !== undefined ? assigned_vehicle_id : driver.assigned_vehicle_id,
        updated_at: db.fn.now()
      });

    if (assigned_vehicle_id) {
      await db('vehicles')
        .where('id', assigned_vehicle_id)
        .andWhere('organization_id', req.organizationId)
        .update({ assigned_driver_id: id });
    }

    const updatedDriver = await db('drivers').where('id', id).first();
    return res.json({ success: true, message: 'Driver updated successfully.', driver: updatedDriver });
  } catch (error) {
    next(error);
  }
}

async function deleteDriver(req, res, next) {
  try {
    const { id } = req.params;
    const driver = await db('drivers')
      .where('id', id)
      .andWhere('organization_id', req.organizationId)
      .first();

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    // Set assigned_driver_id on vehicles to null
    await db('vehicles').where('assigned_driver_id', id).update({ assigned_driver_id: null });
    await db('drivers').where('id', id).andWhere('organization_id', req.organizationId).delete();

    return res.json({ success: true, message: 'Driver deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function getDriverTrips(req, res, next) {
  try {
    const { id } = req.params;
    const trips = await db('trips')
      .leftJoin('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .select('trips.*', 'vehicles.vehicle_number', 'vehicles.model as vehicle_model')
      .where('trips.driver_id', id)
      .andWhere('trips.organization_id', req.organizationId)
      .orderBy('trips.scheduled_start', 'desc');

    return res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverTrips,
  driverSchema
};
