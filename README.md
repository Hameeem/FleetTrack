# FleetTrack — Multi-Tenant Fleet & Trip Management SaaS Platform

[![Node.js Version](https://img.shields.io/badge/node-v22.13.1-green.svg)](https://nodejs.org)
[![Next.js Version](https://img.shields.io/badge/next.js-v14.2-blue.svg)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Live Demo: https://fleettrack-saas.vercel.app  
GitHub: https://github.com/hameem/fleettrack  
API: https://api-fleettrack.render.com  

---

## 🚚 System Overview

**FleetTrack** is a production-quality full-stack multi-tenant fleet and trip management SaaS platform engineered for enterprise fleet operators, logistics companies, and field service fleets.

It features role-based access control (Admin, Manager, Driver), strict multi-tenant isolation, interactive Mapbox GL telematics, live simulated GPS tracking, geofence boundary alerts, pre-trip vehicle safety checklists, incident reports, and real-time operations dashboards.

---

## 🌟 Key Features

1. **Multi-Tenant SaaS Isolation**: Every database entity is tied to an `organization_id`. Organizations operate in total data isolation.
2. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full workspace management (Users, Drivers, Vehicles, Trips, Geofences, Reports).
   - **Manager**: Operations management (Create & assign trips, vehicles/drivers, forms).
   - **Driver**: View assigned trips, update trip status (In Progress, Complete), view route, submit inspection & incident forms.
3. **Operations Dashboard**: Real-time KPI summary cards (Total Vehicles, Active Vehicles, Drivers, Active Trips, Completed Trips, Cancelled Trips, Safety Events, Distance, Utilization) + Interactive Recharts (Trips over time, status pie chart, driver leaderboard, distance trend).
4. **Simulated Live GPS Vehicle Tracking**: Automatic step-by-step vehicle movement along predefined route waypoints for active trips with Socket.io real-time location streaming.
5. **Geofencing & Boundary Alerts**: Create center coordinates + radius (meters). Automated `ENTER` and `EXIT` events logged when vehicles cross geofence perimeters.
6. **Operational Forms**: Pre-trip vehicle safety inspection checklists and incident reports with severity classification.
7. **Production API & MySQL Schema**: Normalized database schema with foreign keys, indexes, Joi request validation, centralized error handling, and JWT authentication.

---

## 🏗️ System Architecture

```
           +-------------------------------------------------------+
           |               Next.js Frontend (React)                |
           |   Chakra UI | Redux Toolkit | Mapbox GL | Recharts    |
           +---------------------------+---------------------------+
                                       | HTTP REST API / WebSockets
                                       v
           +-------------------------------------------------------+
           |               Express.js Backend (Node)               |
           |   JWT Auth | RBAC | Tenant Isolation Middleware       |
           |   Joi Validation | GPS Simulation Engine              |
           +---------------------------+---------------------------+
                                       | SQL Driver (mysql2 / knex)
                                       v
           +-------------------------------------------------------+
           |                 MySQL / Database                      |
           |   Multi-tenant isolated tables with organization_id   |
           +-------------------------------------------------------+
```

---

## 🛠️ Technology Stack

- **Frontend**: React, Next.js 14, Redux Toolkit, Chakra UI, Axios, Mapbox GL JS, Recharts, Lucide Icons, Socket.io Client.
- **Backend**: Node.js, Express.js, MySQL / SQLite (Knex.js), JWT (`jsonwebtoken`), `bcryptjs`, Joi Validation, Socket.io.
- **Database**: MySQL 8.0+ / SQLite 3 (with automatic fallback for instant local dev).
- **Tooling**: Jest, Supertest, Nodemon, Git.

---

## 🗄️ Database Schema

```sql
organizations (id, name, code, created_at, updated_at)
users (id, organization_id, name, email, password_hash, role, employee_id, created_at, updated_at)
drivers (id, organization_id, user_id, name, email, phone, employee_id, license_number, license_expiry, status, assigned_vehicle_id, created_at, updated_at)
vehicles (id, organization_id, vehicle_number, registration_number, vehicle_type, model, status, current_lat, current_lng, last_updated, total_distance, assigned_driver_id, created_at, updated_at)
trips (id, organization_id, trip_number, driver_id, vehicle_id, origin_name, origin_lat, origin_lng, destination_name, destination_lat, destination_lng, scheduled_start, scheduled_end, actual_start, actual_end, route_waypoints, status, distance_km, notes, created_at, updated_at)
trip_locations (id, trip_id, vehicle_id, lat, lng, speed, timestamp)
geofences (id, organization_id, name, center_lat, center_lng, radius_meters, is_active, created_at, updated_at)
geofence_events (id, organization_id, geofence_id, vehicle_id, trip_id, event_type, message, timestamp)
incidents (id, organization_id, driver_id, vehicle_id, trip_id, incident_type, description, location_name, severity, status, created_at)
vehicle_inspections (id, organization_id, driver_id, vehicle_id, brakes_passed, tires_passed, lights_passed, fuel_level, damage_reported, notes, created_at)
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*The backend automatically initializes tables and populates multi-tenant seed data on boot!*  
Backend server runs at `http://localhost:5000`.

### 2. Run Tests
```bash
cd backend
npm test
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend app runs at `http://localhost:3000`.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@apexlogistics.com` | `Password123!` | Apex Logistics Inc. |
| **Manager** | `manager@apexlogistics.com` | `Password123!` | Apex Logistics Inc. |
| **Driver** | `john.miller@apexlogistics.com` | `Password123!` | Apex Logistics Inc. |
| **Admin (Org B)** | `admin@globalexpress.com` | `Password123!` | Global Express Delivery |

---

## 🌐 Deployment Instructions

### Backend (Render / Railway / AWS EC2)
1. Deploy the `backend/` directory to Render / Railway / AWS.
2. Set Environment Variables:
   - `DB_CLIENT=mysql`
   - `DB_HOST=<YOUR_MYSQL_HOST>`
   - `DB_USER=<YOUR_MYSQL_USER>`
   - `DB_PASSWORD=<YOUR_MYSQL_PASSWORD>`
   - `DB_NAME=<YOUR_MYSQL_DATABASE>`
   - `JWT_SECRET=<PRODUCTION_SECRET_KEY>`
   - `CORS_ORIGIN=https://fleettrack-saas.vercel.app`

### Frontend (Vercel)
1. Import `frontend/` directory into Vercel.
2. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://api-fleettrack.render.com/api`
   - `NEXT_PUBLIC_WS_URL=https://api-fleettrack.render.com`
   - `NEXT_PUBLIC_MAPBOX_TOKEN=<YOUR_MAPBOX_TOKEN>`

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
