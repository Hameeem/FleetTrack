import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vehicles: [],
  drivers: [],
  trips: [],
  geofences: [],
  geofenceEvents: [],
  liveTracking: {
    vehicles: [],
    activeTrips: [],
    geofences: [],
    recentEvents: []
  },
  summary: null,
  loading: false,
  error: null
};

const fleetSlice = createSlice({
  name: 'fleet',
  initialState,
  reducers: {
    setVehicles: (state, action) => {
      state.vehicles = action.payload;
    },
    setDrivers: (state, action) => {
      state.drivers = action.payload;
    },
    setTrips: (state, action) => {
      state.trips = action.payload;
    },
    setGeofences: (state, action) => {
      state.geofences = action.payload;
    },
    setGeofenceEvents: (state, action) => {
      state.geofenceEvents = action.payload;
    },
    setLiveTracking: (state, action) => {
      state.liveTracking = action.payload;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
    },
    setFleetLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFleetError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setVehicles,
  setDrivers,
  setTrips,
  setGeofences,
  setGeofenceEvents,
  setLiveTracking,
  setSummary,
  setFleetLoading,
  setFleetError
} = fleetSlice.actions;

export default fleetSlice.reducer;
