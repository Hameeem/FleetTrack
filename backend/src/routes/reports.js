const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/auth');
const enforceTenantIsolation = require('../middleware/tenantIsolation');

router.use(authenticateToken);
router.use(enforceTenantIsolation);

router.get('/', reportController.getDashboardSummary);

module.exports = router;
