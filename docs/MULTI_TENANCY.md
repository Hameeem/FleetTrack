# Multi-Tenancy Architecture & Security Isolation

## Overview

**FleetTrack** is built from the ground up with strict multi-tenant isolation. Every organization operates in complete isolation, ensuring Organization A can **never** access, modify, or leak data belonging to Organization B.

---

## Technical Isolation Layers

### 1. Database Schema Design
Every tenant entity table (`users`, `drivers`, `vehicles`, `trips`, `geofences`, `geofence_events`, `incidents`, `vehicle_inspections`) enforces an indexed `organization_id` foreign key referencing `organizations(id)`:

```sql
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    ...
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_vehicle_org (organization_id)
);
```

### 2. JWT Middleware Authentication
Upon authentication, the backend encodes `organization_id` into the signed JWT token payload. The client cannot tamper with or modify this value:

```js
const token = jwt.sign(
  {
    id: user.id,
    role: user.role,
    organization_id: user.organization_id
  },
  JWT_SECRET
);
```

### 3. Tenant Isolation Middleware (`enforceTenantIsolation`)
Every protected route passes through `enforceTenantIsolation`, which extracts `organization_id` from `req.user` and provides a query-scoping helper `req.tenantQuery(table)`:

```js
function enforceTenantIsolation(req, res, next) {
  if (!req.user || !req.user.organization_id) {
    return res.status(403).json({ success: false, message: 'Access denied. No tenant organization.' });
  }
  req.organizationId = Number(req.user.organization_id);
  next();
}
```

### 4. Query-Level Enforcement Example
When retrieving trips or updating vehicles, database queries explicitly bind `.where('organization_id', req.organizationId)`:

```js
// GET /api/trips
const trips = await db('trips')
  .where('trips.organization_id', req.organizationId)
  .select('*');
```

Even if a malicious user in Organization A guesses the numeric ID of a trip belonging to Organization B (`GET /api/trips/99`), the database query evaluates:

```sql
SELECT * FROM trips WHERE id = 99 AND organization_id = 1;
```

Since trip 99 belongs to `organization_id = 2`, the query returns zero records, resulting in a safe `404 Not Found` response.

---

## Automated Verification Tests
The backend test suite includes `backend/tests/tenant_isolation.test.js` which programmatically executes cross-tenant queries and verifies zero data leakage across organizations.
