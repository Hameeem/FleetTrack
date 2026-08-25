# FleetTrack Architecture & System Design Document

## System Overview

**FleetTrack** is a production-grade multi-tenant Fleet & Trip Management SaaS Platform. It provides enterprise fleet operators, managers, and drivers with real-time GPS telematics tracking, trip lifecycle dispatching, geofencing boundary alerts, pre-trip vehicle safety checklists, and operational analytics.

```
+-------------------------------------------------------------------------+
|                          Next.js Frontend                               |
|   Chakra UI | Redux Toolkit | Mapbox GL Telematics | Recharts | Axios    |
+------------------------------------+------------------------------------+
                                     | HTTP REST APIs / Socket.io WebSockets
                                     v
+-------------------------------------------------------------------------+
|                          Node.js / Express Backend                      |
|   JWT Authentication | Role-Based Access Control | Tenant Isolation     |
|   Joi Schema Validation | Real-Time GPS Simulation Engine             |
+------------------------------------+------------------------------------+
                                     | SQL Abstraction Layer (Knex.js)
                                     v
+-------------------------------------------------------------------------+
|                       MySQL / Database Layer                            |
|   Strict Tenant Isolation via organization_id on all entity tables      |
+-------------------------------------------------------------------------+
```

---

## Technical Core Components

### 1. Frontend Architecture
- **Framework**: Next.js (React)
- **UI Framework**: Chakra UI (Enterprise component system)
- **Global State**: Redux Toolkit (`authSlice` for tenant/session context, `fleetSlice` for telematics & roster)
- **API Client**: Axios instance with automatic JWT Bearer header injection & 401 interceptor
- **Map & Telematics**: Mapbox GL JS with MapLibre GL fallback
- **Data Visualization**: Recharts (Trips over time, status pie chart, driver leaderboard, distance trend)

### 2. Backend Architecture
- **Runtime**: Node.js & Express.js
- **Real-Time WebSockets**: Socket.io for live vehicle location updates (`vehicle_location`) and geofence alerts (`geofence_alert`)
- **Authentication**: JWT token encoding `userId`, `email`, `role`, and `organization_id`
- **Authorization**: RBAC Middleware (`Admin`, `Manager`, `Driver`)
- **Tenant Isolation**: Mandatory `organization_id` filtering enforced across 100% of database queries

### 3. Database Layer
- **SQL Dialect**: MySQL 8.0+ compatible schema
- **ORM / Query Builder**: Knex.js with `mysql2` driver (with zero-config SQLite fallback for instant local evaluation)
- **Primary Schema Tables**:
  - `organizations`
  - `users`
  - `drivers`
  - `vehicles`
  - `trips`
  - `trip_locations`
  - `geofences`
  - `geofence_events`
  - `incidents`
  - `vehicle_inspections`

### 4. Simulated GPS Telematics Engine
Because physical GPS hardware is simulated in development:
- The backend runs a 3-second tick interval timer (`startGPSSimulator`).
- Automatically advances all trips in `In Progress` status along interpolated route waypoints (`origin` ➔ `waypoints` ➔ `destination`).
- Updates `vehicles.current_lat`, `vehicles.current_lng`, and `vehicles.total_distance`.
- Logs position records into `trip_locations`.
- Evaluates Haversine distance to active geofences, automatically creating `ENTER` and `EXIT` events when boundaries are crossed.
