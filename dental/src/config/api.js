const API_CONFIG = {
  // Backend base URL - can be overridden by environment variable
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://dental-backend-s893.onrender.com',
  
  // API base path
  BASE_URL: '/api/v1',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/auth/signup',
      SIGNIN: '/auth/signin',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    USERS: {
      BASE: '/users',
      PROFILE: '/users/profile',
      STAFF: '/users/staff',
      CLIENTS: '/users/clients',
      DOCTORS: '/users/doctors',
      DETAIL: '/users',
    },
    PATIENTS: {
      BASE: '/patients',
    },
    APPOINTMENTS: {
      BASE: '/appointments',
      DOCTOR: '/appointments/doctor',
      CLIENT: '/appointments/client',
      DETAIL: '/appointments',
    }
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BACKEND_URL}${API_CONFIG.BASE_URL}${endpoint}`;
};

// Common API request configurations
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export default API_CONFIG;