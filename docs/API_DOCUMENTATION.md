# FleetTrack REST API Documentation

Base URL: `/api`

Authentication: All endpoints (except `/api/auth/login` and `/api/auth/register`) require an `Authorization` header formatted as:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication (`/api/auth`)

### POST `/api/auth/register`
Register a new tenant organization and initial administrator user.

**Request Body:**
```json
{
  "name": "Sarah Jenkins",
  "email": "admin@apexlogistics.com",
  "password": "Password123!",
  "role": "Admin",
  "organization_name": "Apex Logistics Inc.",
  "organization_code": "APEXLOG"
}
```

### POST `/api/auth/login`
Authenticate user and return JWT bearer token.

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Sarah Jenkins",
    "email": "admin@apexlogistics.com",
    "role": "Admin",
    "organization_id": 1,
    "organization_name": "Apex Logistics Inc."
  }
}
```

### GET `/api/auth/me`
Retrieve currently logged-in user profile.

---

## 2. Driver Management (`/api/drivers`)

- `GET /api/drivers` — List organization drivers (supports `?search=` and `?status=`).
- `GET /api/drivers/:id` — Retrieve driver details and trip statistics.
- `GET /api/drivers/:id/trips` — Retrieve trip history for driver.
- `POST /api/drivers` — Create driver (Requires Admin or Manager role).
- `PUT /api/drivers/:id` — Update driver profile.
- `DELETE /api/drivers/:id` — Delete driver record.

---

## 3. Vehicle Management (`/api/vehicles`)

- `GET /api/vehicles` — List organization vehicles (supports `?status=` and `?type=`).
- `GET /api/vehicles/:id` — Retrieve vehicle telematics & recent trips.
- `POST /api/vehicles` — Register new vehicle asset.
- `PUT /api/vehicles/:id` — Update vehicle asset configuration or driver assignment.
- `DELETE /api/vehicles/:id` — Delete vehicle asset.

---

## 4. Trip Management (`/api/trips`)

- `GET /api/trips` — List trips (automatically scoped by tenant and driver role).
- `POST /api/trips` — Create and dispatch trip.
- `POST /api/trips/:id/start` — Start trip (engages live simulated GPS tracking).
- `POST /api/trips/:id/complete` — Complete trip and update vehicle odometer.
- `POST /api/trips/:id/cancel` — Cancel trip.

---

## 5. Telematics & Geofences

- `GET /api/tracking` — Live tracking payload (active vehicle coordinates, trips, geofence status).
- `GET /api/geofences` — List geofenced boundary zones.
- `POST /api/geofences` — Create new geofence circle (Center Lat/Lng + Radius).
- `GET /api/geofences/events` — Retrieve geofence boundary crossing events.
- `GET /api/reports` — Operations dashboard summary & analytics data.
