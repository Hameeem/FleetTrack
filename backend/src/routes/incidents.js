const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const authenticateToken = require('../middleware/auth');
const enforceTenantIsolation = require('../middleware/tenantIsolation');
const validateRequest = require('../middleware/validate');

router.use(authenticateToken);
router.use(enforceTenantIsolation);

// Incidents
router.get('/incidents', incidentController.getIncidents);
router.post('/incidents', validateRequest(incidentController.incidentSchema), incidentController.createIncident);

// Inspections
router.get('/inspections', incidentController.getInspections);
router.post('/inspections', validateRequest(incidentController.inspectionSchema), incidentController.createInspection);

module.exports = router;
