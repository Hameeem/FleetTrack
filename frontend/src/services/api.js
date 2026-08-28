import axios from 'axios';
import {
  mockUsers,
  mockDrivers,
  mockVehicles,
  mockTrips,
  mockGeofences,
  mockGeofenceEvents,
  mockIncidents,
  mockInspections
} from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fleettrack_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to resolve current user's organization_id from stored user
function getCurrentUserOrgId() {
  if (typeof window !== 'undefined') {
    try {
      const savedUser = localStorage.getItem('fleettrack_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u.organization_id || 1;
      }
    } catch (e) {}
  }
  return 1;
}

// Fallback Mock Data Resolver for CORS / Network errors
function resolveDemoResponse(url, method, rawData) {
  const orgId = getCurrentUserOrgId();

  // 1. AUTH LOGIN
  if (url.includes('/auth/login')) {
    let reqData = {};
    try { reqData = typeof rawData === 'string' ? JSON.parse(rawData) : (rawData || {}); } catch (e) {}
    const reqEmail = (reqData.email || 'manager@apexlogistics.com').toLowerCase();

    let matchedUser = mockUsers.find(u => u.email.toLowerCase() === reqEmail);
    if (!matchedUser) {
      matchedUser = {
        id: reqEmail.includes('admin') ? 1 : reqEmail.includes('driver') ? 3 : 2,
        name: reqEmail.includes('admin') ? 'Sarah Jenkins (Admin)' : reqEmail.includes('driver') ? 'John Miller (Driver)' : 'Marcus Vance (Manager)',
        email: reqEmail,
        role: reqEmail.includes('admin') ? 'Admin' : reqEmail.includes('driver') ? 'Driver' : 'Manager',
        organization_id: reqEmail.includes('global') ? 2 : 1,
        organization_name: reqEmail.includes('global') ? 'Global Express Delivery' : 'Apex Logistics Inc.',
        employee_id: 'EMP-APEX-001'
      };
    }

    return {
      data: {
        success: true,
        message: 'Logged in via Live Demo Mode (CORS Fallback).',
        token: 'demo-jwt-token-2026-apex',
        user: matchedUser
      }
    };
  }

  // 2. AUTH REGISTER
  if (url.includes('/auth/register')) {
    let reqData = {};
    try { reqData = typeof rawData === 'string' ? JSON.parse(rawData) : (rawData || {}); } catch (e) {}
    const newUser = {
      id: 99,
      name: reqData.name || 'New Admin',
      email: reqData.email || 'new@company.com',
      role: reqData.role || 'Admin',
      organization_id: 1,
      organization_name: reqData.organization_name || 'Apex Logistics Inc.',
      employee_id: 'EMP-NEW-01'
    };
    return { data: { success: true, token: 'demo-jwt-token-2026-new', user: newUser } };
  }

  // 3. AUTH ME
  if (url.includes('/auth/me')) {
    let savedUser = mockUsers[0];
    if (typeof window !== 'undefined') {
      try {
        const su = localStorage.getItem('fleettrack_user');
        if (su) savedUser = JSON.parse(su);
      } catch (e) {}
    }
    return { data: { success: true, user: savedUser } };
  }

  // 4. REPORTS
  if (url.includes('/reports')) {
    const tenantVehicles = mockVehicles.filter(v => v.organization_id === orgId);
    const tenantDrivers = mockDrivers.filter(d => d.organization_id === orgId);
    const tenantTrips = mockTrips.filter(t => t.organization_id === orgId);
    const tenantIncidents = mockIncidents.filter(i => i.organization_id === orgId);
    const activeV = tenantVehicles.filter(v => v.status === 'On Trip').length;

    return {
      data: {
        success: true,
        summary: {
          total_vehicles: tenantVehicles.length,
          active_vehicles: activeV,
          available_vehicles: tenantVehicles.filter(v => v.status === 'Available').length,
          total_drivers: tenantDrivers.length,
          total_trips: tenantTrips.length,
          active_trips: tenantTrips.filter(t => t.status === 'In Progress').length,
          completed_trips: tenantTrips.filter(t => t.status === 'Completed').length,
          cancelled_trips: tenantTrips.filter(t => t.status === 'Cancelled').length,
          safety_incidents: tenantIncidents.length,
          total_distance_km: 27370,
          utilization_rate: tenantVehicles.length > 0 ? Math.round((activeV / tenantVehicles.length) * 100) : 0
        },
        charts: {
          statusDistribution: [
            { name: 'Completed', value: tenantTrips.filter(t => t.status === 'Completed').length || 1, color: '#38A169' },
            { name: 'In Progress', value: tenantTrips.filter(t => t.status === 'In Progress').length || 1, color: '#3182CE' },
            { name: 'Assigned', value: tenantTrips.filter(t => t.status === 'Assigned').length || 1, color: '#DD6B20' }
          ],
          tripsOverTime: [
            { day: 'Mon', completed: 4, distance: 140 },
            { day: 'Tue', completed: 6, distance: 210 },
            { day: 'Wed', completed: 5, distance: 185 },
            { day: 'Thu', completed: 7, distance: 290 },
            { day: 'Fri', completed: 8, distance: 340 }
          ],
          vehiclesByType: [
            { type: 'Heavy Duty Truck', count: 2 },
            { type: 'Cargo Van', count: 2 },
            { type: 'Electric Cargo', count: 1 }
          ],
          driverActivity: tenantDrivers.map(d => ({ name: d.name, trips: 4, status: d.status }))
        },
        recentTrips: tenantTrips
      }
    };
  }

  // 5. DRIVERS
  if (url.includes('/drivers')) {
    const tenantDrivers = mockDrivers.filter(d => d.organization_id === orgId);
    return { data: { success: true, count: tenantDrivers.length, drivers: tenantDrivers, driver: tenantDrivers[0] } };
  }

  // 6. VEHICLES
  if (url.includes('/vehicles')) {
    const tenantVehicles = mockVehicles.filter(v => v.organization_id === orgId);
    return { data: { success: true, count: tenantVehicles.length, vehicles: tenantVehicles, vehicle: tenantVehicles[0] } };
  }

  // 7. TRIPS
  if (url.includes('/trips')) {
    const tenantTrips = mockTrips.filter(t => t.organization_id === orgId);
    return { data: { success: true, count: tenantTrips.length, trips: tenantTrips, trip: tenantTrips[0] } };
  }

  // 8. TRACKING
  if (url.includes('/tracking')) {
    const tenantVehicles = mockVehicles.filter(v => v.organization_id === orgId);
    const tenantTrips = mockTrips.filter(t => t.organization_id === orgId && t.status === 'In Progress');
    const tenantGeofences = mockGeofences.filter(g => g.organization_id === orgId);
    const tenantEvents = mockGeofenceEvents.filter(e => e.organization_id === orgId);
    return { data: { success: true, vehicles: tenantVehicles, activeTrips: tenantTrips, geofences: tenantGeofences, recentEvents: tenantEvents } };
  }

  // 9. GEOFENCES
  if (url.includes('/geofences')) {
    const tenantGeofences = mockGeofences.filter(g => g.organization_id === orgId);
    const tenantEvents = mockGeofenceEvents.filter(e => e.organization_id === orgId);
    return { data: { success: true, count: tenantGeofences.length, geofences: tenantGeofences, events: tenantEvents } };
  }

  // 10. INCIDENTS
  if (url.includes('/incidents')) {
    const tenantIncidents = mockIncidents.filter(i => i.organization_id === orgId);
    const tenantInspections = mockInspections.filter(i => i.organization_id === orgId);
    return { data: { success: true, incidents: tenantIncidents, inspections: tenantInspections } };
  }

  return { data: { success: true, message: 'Operation completed in Demo Mode.' } };
}

// Response Interceptor: Catch CORS / Network errors and resolve Demo Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Session expired from active server
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('fleettrack_token');
        localStorage.removeItem('fleettrack_user');
        window.location.href = '/login?expired=1';
      }
      return Promise.reject(error);
    }

    // CORS error / net::ERR_FAILED / Network error / Server unreachable
    const isCorsOrNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
    if (isCorsOrNetworkError) {
      const url = error.config?.url || '';
      const method = (error.config?.method || 'get').toLowerCase();

      console.warn(`[FleetTrack API Interceptor] CORS / Network Error on endpoint '${url}'. Resolving fallback demo response.`);
      return Promise.resolve(resolveDemoResponse(url, method, error.config?.data));
    }

    return Promise.reject(error);
  }
);

export default api;
