const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

router.post('/register', validateRequest(authController.registerSchema), authController.register);
router.post('/login', validateRequest(authController.loginSchema), authController.login);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
