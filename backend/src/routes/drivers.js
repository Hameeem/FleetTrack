const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authenticateToken = require('../middleware/auth');
const enforceTenantIsolation = require('../middleware/tenantIsolation');
const authorizeRoles = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');

router.use(authenticateToken);
router.use(enforceTenantIsolation);

router.get('/', driverController.getDrivers);
router.get('/:id', driverController.getDriverById);
router.get('/:id/trips', driverController.getDriverTrips);

// Modification routes require Admin or Manager
router.post('/', authorizeRoles('Admin', 'Manager'), validateRequest(driverController.driverSchema), driverController.createDriver);
router.put('/:id', authorizeRoles('Admin', 'Manager'), driverController.updateDriver);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), driverController.deleteDriver);

module.exports = router;
