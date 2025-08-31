import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { buildApiUrl, API_HEADERS } from '../config/api';
import API_CONFIG from '../config/api';

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

  // Refresh access token using refresh token
  const refreshToken = async () => {
    const refresh_token = sessionStorage.getItem('refresh_token');
    
    if (!refresh_token) {
      console.error('No refresh token found');
      logout();
      return null;
    }

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ refresh_token })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 200 && data.data) {
        const { access_token, refresh_token: new_refresh_token, expires_in, token_type } = data.data;
        
        // Update tokens in session storage
        sessionStorage.setItem('access_token', access_token);
        sessionStorage.setItem('refresh_token', new_refresh_token);
        sessionStorage.setItem('expires_in', expires_in);
        sessionStorage.setItem('token_type', token_type);
        sessionStorage.setItem('login_time', Date.now());

        // Update user info from new access token
        const userInfo = getUserFromToken(access_token);
        if (userInfo) {
          setUser(userInfo);
          setIsAuthenticated(true);
        }

        return access_token;
      } else {
        throw new Error('Invalid refresh response format');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
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

  // Get authorization header for API requests with automatic refresh
  const getAuthHeader = async () => {
    let token = sessionStorage.getItem('access_token');
    const tokenType = sessionStorage.getItem('token_type') || 'Bearer';
    
    if (!token) {
      return {};
    }

    // If token is expired, try to refresh it
    if (!isTokenValid(token)) {
      console.log('Access token expired, attempting to refresh...');
      token = await refreshToken();
      
      if (!token) {
        return {};
      }
    }
    
    return { Authorization: `${tokenType} ${token}` };
  };

  // Synchronous version for backward compatibility
  const getAuthHeaderSync = () => {
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

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Refresh token 2 minutes before expiration (or immediately if already expired)
      const refreshTime = Math.max(0, timeUntilExpiration - 120000);

      if (timeUntilExpiration > 0) {
        // Set timer to refresh token before it expires
        const timer = setTimeout(async () => {
          console.log('Token about to expire, attempting refresh...');
          const newToken = await refreshToken();
          
          if (!newToken) {
            console.log('Token refresh failed, logging out...');
            // Session will be terminated by refreshToken function if it fails
          }
        }, refreshTime);

        return () => clearTimeout(timer);
      } else {
        // Token already expired, attempt refresh
        refreshToken();
      }
    } catch (error) {
      console.error('Error setting up token refresh timer:', error);
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
    getAuthHeaderSync,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};