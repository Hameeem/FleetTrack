const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authenticateToken = require('../middleware/auth');
const enforceTenantIsolation = require('../middleware/tenantIsolation');
const authorizeRoles = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');

router.use(authenticateToken);
router.use(enforceTenantIsolation);

router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTripById);

// Driver, Admin, Manager can start/complete assigned trips
router.post('/:id/start', tripController.startTrip);
router.post('/:id/complete', tripController.completeTrip);
router.post('/:id/cancel', authorizeRoles('Admin', 'Manager'), tripController.cancelTrip);

// Admin & Manager trip management
router.post('/', authorizeRoles('Admin', 'Manager'), validateRequest(tripController.tripSchema), tripController.createTrip);
router.put('/:id', authorizeRoles('Admin', 'Manager'), tripController.updateTrip);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), tripController.deleteTrip);

module.exports = router;
