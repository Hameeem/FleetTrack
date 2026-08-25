const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const authenticateToken = require('../middleware/auth');
const enforceTenantIsolation = require('../middleware/tenantIsolation');

router.use(authenticateToken);
router.use(enforceTenantIsolation);

router.get('/', trackingController.getLiveTracking);

module.exports = router;
