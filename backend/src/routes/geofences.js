const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofenceController');
const authenticateToken = require('../middleware/auth');
const enforceTenantIsolation = require('../middleware/tenantIsolation');
const authorizeRoles = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');

router.use(authenticateToken);
router.use(enforceTenantIsolation);

router.get('/', geofenceController.getGeofences);
router.get('/events', geofenceController.getGeofenceEvents);

router.post('/', authorizeRoles('Admin', 'Manager'), validateRequest(geofenceController.geofenceSchema), geofenceController.createGeofence);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), geofenceController.deleteGeofence);

module.exports = router;
