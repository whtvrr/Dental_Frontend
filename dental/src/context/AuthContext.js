import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isTokenValid: () => false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is valid (not expired)
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  };

  // Get user info from token
  const getUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded.user_id,
        email: decoded.email,
        fullName: decoded.full_name,
        role: decoded.role,
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  };

  // Login function
  const login = (tokens) => {
    const { access_token, refresh_token, expires_in, token_type } = tokens;
    
    // Store tokens in session storage
    sessionStorage.setItem('access_token', access_token);
    sessionStorage.setItem('refresh_token', refresh_token);
    sessionStorage.setItem('expires_in', expires_in);
    sessionStorage.setItem('token_type', token_type);
    sessionStorage.setItem('login_time', Date.now());

    // Extract user info from access token
    const userInfo = getUserFromToken(access_token);
    
    if (userInfo) {
      setUser(userInfo);
      setIsAuthenticated(true);
    }
  };

  // Logout function
  const logout = () => {
    // Clear session storage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('expires_in');
    sessionStorage.removeItem('token_type');
    sessionStorage.removeItem('login_time');

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Get authorization header for API requests
  const getAuthHeader = () => {
    const token = sessionStorage.getItem('access_token');
    const tokenType = sessionStorage.getItem('token_type') || 'Bearer';
    
    if (token && isTokenValid(token)) {
      return { Authorization: `${tokenType} ${token}` };
    }
    
    return {};
  };

  // Check for existing valid session on app load
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    
    if (token && isTokenValid(token)) {
      const userInfo = getUserFromToken(token);
      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
      }
    } else if (token) {
      // Token exists but is invalid, clear it
      logout();
    }
    
    setIsLoading(false);
  }, []);

  // Auto-logout when token expires
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration > 0) {
        // Set timer to auto-logout when token expires
        const timer = setTimeout(() => {
          console.log('Token expired, logging out...');
          logout();
        }, timeUntilExpiration);

        return () => clearTimeout(timer);
      } else {
        // Token already expired
        logout();
      }
    } catch (error) {
      console.error('Error setting up auto-logout timer:', error);
      logout();
    }
  }, [isAuthenticated]);

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    isTokenValid,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};