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

// Response Interceptor: Fallback to Mock Data when Backend server is Offline / Unreachable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If real backend responds with 401, clear session
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('fleettrack_token');
        localStorage.removeItem('fleettrack_user');
        window.location.href = '/login?expired=1';
      }
      return Promise.reject(error);
    }

    // Network error / Backend offline -> Activate Live Client Demo Mode
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404;

    if (isNetworkError) {
      const url = error.config?.url || '';
      const method = (error.config?.method || 'get').toLowerCase();

      console.warn(`[FleetTrack Offline Demo Mode] Live API backend unreachable (${url}). Serving multi-tenant client simulation data.`);

      // 1. AUTH LOGIN
      if (url.includes('/auth/login') && method === 'post') {
        let reqData = {};
        try { reqData = JSON.parse(error.config.data || '{}'); } catch (e) {}
        const reqEmail = (reqData.email || '').toLowerCase();

        let matchedUser = mockUsers.find(u => u.email.toLowerCase() === reqEmail);
        if (!matchedUser) {
          matchedUser = {
            id: 99,
            name: reqEmail.split('@')[0] || 'Demo User',
            email: reqEmail,
            role: 'Admin',
            organization_id: 1,
            organization_name: 'Apex Logistics Inc.',
            employee_id: 'EMP-DEMO-99'
          };
        }

        return Promise.resolve({
          data: {
            success: true,
            message: 'Logged in via Offline Demo Mode.',
            token: 'demo-jwt-token-2026-apex',
            user: matchedUser
          }
        });
      }

      // 2. AUTH REGISTER
      if (url.includes('/auth/register') && method === 'post') {
        let reqData = {};
        try { reqData = JSON.parse(error.config.data || '{}'); } catch (e) {}
        const newUser = {
          id: Math.floor(100 + Math.random() * 900),
          name: reqData.name || 'New Admin',
          email: reqData.email || 'new@company.com',
          role: reqData.role || 'Admin',
          organization_id: Math.floor(10 + Math.random() * 90),
          organization_name: reqData.organization_name || 'New Logistics Org',
          employee_id: 'EMP-NEW-01'
        };
        return Promise.resolve({
          data: {
            success: true,
            message: 'Organization workspace registered in Demo Mode.',
            token: 'demo-jwt-token-2026-new',
            user: newUser
          }
        });
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
        return Promise.resolve({ data: { success: true, user: savedUser } });
      }

      const orgId = getCurrentUserOrgId();

      // 4. REPORTS / DASHBOARD SUMMARY
      if (url.includes('/reports')) {
        const tenantVehicles = mockVehicles.filter(v => v.organization_id === orgId);
        const tenantDrivers = mockDrivers.filter(d => d.organization_id === orgId);
        const tenantTrips = mockTrips.filter(t => t.organization_id === orgId);
        const tenantIncidents = mockIncidents.filter(i => i.organization_id === orgId);

        const activeV = tenantVehicles.filter(v => v.status === 'On Trip').length;
        const availV = tenantVehicles.filter(v => v.status === 'Available').length;
        const totalV = tenantVehicles.length;

        return Promise.resolve({
          data: {
            success: true,
            summary: {
              total_vehicles: totalV,
              active_vehicles: activeV,
              available_vehicles: availV,
              total_drivers: tenantDrivers.length,
              total_trips: tenantTrips.length,
              active_trips: tenantTrips.filter(t => t.status === 'In Progress').length,
              completed_trips: tenantTrips.filter(t => t.status === 'Completed').length,
              cancelled_trips: tenantTrips.filter(t => t.status === 'Cancelled').length,
              safety_incidents: tenantIncidents.length,
              total_distance_km: 27370,
              utilization_rate: totalV > 0 ? Math.round((activeV / totalV) * 100) : 0
            },
            charts: {
              statusDistribution: [
                { name: 'Completed', value: tenantTrips.filter(t => t.status === 'Completed').length || 1, color: '#38A169' },
                { name: 'In Progress', value: tenantTrips.filter(t => t.status === 'In Progress').length || 1, color: '#3182CE' },
                { name: 'Scheduled / Assigned', value: tenantTrips.filter(t => t.status === 'Assigned').length || 1, color: '#DD6B20' },
                { name: 'Cancelled', value: 0, color: '#E53E3E' }
              ],
              tripsOverTime: [
                { day: 'Mon', completed: 4, cancelled: 0, distance: 140 },
                { day: 'Tue', completed: 6, cancelled: 0, distance: 210 },
                { day: 'Wed', completed: 5, cancelled: 1, distance: 185 },
                { day: 'Thu', completed: 7, cancelled: 0, distance: 290 },
                { day: 'Fri', completed: 8, cancelled: 0, distance: 340 },
                { day: 'Sat', completed: 3, cancelled: 0, distance: 110 },
                { day: 'Sun', completed: 2, cancelled: 0, distance: 95 }
              ],
              vehiclesByType: [
                { type: 'Heavy Duty Truck', count: 2 },
                { type: 'Cargo Van', count: 2 },
                { type: 'Electric Cargo', count: 1 },
                { type: 'Delivery Van', count: 1 }
              ],
              driverActivity: tenantDrivers.map(d => ({ name: d.name, trips: 4, status: d.status }))
            },
            recentTrips: tenantTrips
          }
        });
      }

      // 5. DRIVERS
      if (url.includes('/drivers')) {
        const tenantDrivers = mockDrivers.filter(d => d.organization_id === orgId);
        return Promise.resolve({
          data: {
            success: true,
            count: tenantDrivers.length,
            drivers: tenantDrivers,
            driver: tenantDrivers[0] || mockDrivers[0],
            trips: mockTrips.filter(t => t.organization_id === orgId)
          }
        });
      }

      // 6. VEHICLES
      if (url.includes('/vehicles')) {
        const tenantVehicles = mockVehicles.filter(v => v.organization_id === orgId);
        return Promise.resolve({
          data: {
            success: true,
            count: tenantVehicles.length,
            vehicles: tenantVehicles,
            vehicle: tenantVehicles[0] || mockVehicles[0],
            trips: mockTrips.filter(t => t.organization_id === orgId)
          }
        });
      }

      // 7. TRIPS
      if (url.includes('/trips')) {
        const tenantTrips = mockTrips.filter(t => t.organization_id === orgId);
        return Promise.resolve({
          data: {
            success: true,
            count: tenantTrips.length,
            trips: tenantTrips,
            trip: tenantTrips[0] || mockTrips[0]
          }
        });
      }

      // 8. TRACKING
      if (url.includes('/tracking')) {
        const tenantVehicles = mockVehicles.filter(v => v.organization_id === orgId);
        const tenantTrips = mockTrips.filter(t => t.organization_id === orgId && t.status === 'In Progress');
        const tenantGeofences = mockGeofences.filter(g => g.organization_id === orgId);
        const tenantEvents = mockGeofenceEvents.filter(e => e.organization_id === orgId);

        return Promise.resolve({
          data: {
            success: true,
            timestamp: new Date().toISOString(),
            vehicles: tenantVehicles,
            activeTrips: tenantTrips,
            geofences: tenantGeofences,
            recentEvents: tenantEvents
          }
        });
      }

      // 9. GEOFENCES
      if (url.includes('/geofences')) {
        const tenantGeofences = mockGeofences.filter(g => g.organization_id === orgId);
        const tenantEvents = mockGeofenceEvents.filter(e => e.organization_id === orgId);
        return Promise.resolve({
          data: {
            success: true,
            count: tenantGeofences.length,
            geofences: tenantGeofences,
            events: tenantEvents
          }
        });
      }

      // 10. INCIDENTS / INSPECTIONS
      if (url.includes('/incidents')) {
        const tenantIncidents = mockIncidents.filter(i => i.organization_id === orgId);
        const tenantInspections = mockInspections.filter(i => i.organization_id === orgId);
        return Promise.resolve({
          data: {
            success: true,
            incidents: tenantIncidents,
            inspections: tenantInspections
          }
        });
      }

      // Fallback for any other write operations
      return Promise.resolve({
        data: {
          success: true,
          message: 'Operation completed in Demo Mode.'
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
