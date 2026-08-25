function enforceTenantIsolation(req, res, next) {
  if (!req.user || !req.user.organization_id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User has no associated tenant organization.'
    });
  }

  req.organizationId = Number(req.user.organization_id);

  // Helper method to automatically scope Knex queries by tenant organization_id
  req.tenantQuery = (table) => {
    const db = require('../config/db');
    return db(table).where(`${table}.organization_id`, req.organizationId);
  };

  next();
}

module.exports = enforceTenantIsolation;
