const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authenticateToken = require('../middleware/auth');
const enforceTenantIsolation = require('../middleware/tenantIsolation');
const authorizeRoles = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');

router.use(authenticateToken);
router.use(enforceTenantIsolation);

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:id/trips', vehicleController.getVehicleTrips);

// Modification routes require Admin or Manager
router.post('/', authorizeRoles('Admin', 'Manager'), validateRequest(vehicleController.vehicleSchema), vehicleController.createVehicle);
router.put('/:id', authorizeRoles('Admin', 'Manager'), vehicleController.updateVehicle);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), vehicleController.deleteVehicle);

module.exports = router;
