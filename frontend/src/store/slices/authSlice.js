import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  let user = null;
  let token = null;
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('fleettrack_user');
    const savedToken = localStorage.getItem('fleettrack_token');
    if (savedUser && savedToken) {
      try {
        user = JSON.parse(savedUser);
        token = savedToken;
      } catch (e) {
        user = null;
        token = null;
      }
    }
  }
  return {
    user,
    token,
    isAuthenticated: !!token,
    loading: false,
    error: null
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setAuthSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fleettrack_token', action.payload.token);
        localStorage.setItem('fleettrack_user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fleettrack_token');
        localStorage.removeItem('fleettrack_user');
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setAuthSuccess, logout, setError, setLoading } = authSlice.actions;
export default authSlice.reducer;
