const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./src/config/db');
const { runMigrations } = require('./src/utils/migrate');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { startGPSSimulator } = require('./src/simulation/simulator');

// Import Route Handlers
const authRoutes = require('./src/routes/auth');
const driverRoutes = require('./src/routes/drivers');
const vehicleRoutes = require('./src/routes/vehicles');
const tripRoutes = require('./src/routes/trips');
const trackingRoutes = require('./src/routes/tracking');
const geofenceRoutes = require('./src/routes/geofences');
const incidentRoutes = require('./src/routes/incidents');
const reportRoutes = require('./src/routes/reports');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FleetTrack Multi-Tenant Backend API',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/reports', reportRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint '${req.originalUrl}' not found.` });
});

// Centralized Error Handler
app.use(errorHandler);

// Socket.io Connection Events
io.on('connection', (socket) => {
  logger.info(`[WebSocket] Client connected: ${socket.id}`);

  socket.on('join_organization', (orgId) => {
    socket.join(`org_${orgId}`);
    logger.info(`[WebSocket] Client ${socket.id} joined channel org_${orgId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

let dbInitPromise = null;

function ensureDatabase() {
  if (!dbInitPromise) {
    dbInitPromise = runMigrations(db);
  }
  return dbInitPromise;
}

async function bootstrap() {
  try {
    // 1. Run migrations and auto-seeding
    await ensureDatabase();

    // 2. Start Simulated GPS Tracking Engine
    if (process.env.NODE_ENV !== 'test') {
      startGPSSimulator(io, 3000);
    }

    // 3. Start HTTP + WS Server
    if (process.env.NODE_ENV !== 'test') {
      server.listen(PORT, () => {
        logger.info(`==================================================`);
        logger.info(` FleetTrack SaaS API Server running on port ${PORT}`);
        logger.info(` Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(` Database: ${process.env.DB_CLIENT || 'sqlite3'}`);
        logger.info(`==================================================`);
      });
    }
  } catch (err) {
    logger.error('Failed to bootstrap server:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

bootstrap();

module.exports = { app, server, ensureDatabase };
