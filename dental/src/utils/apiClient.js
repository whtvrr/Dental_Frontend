import { buildApiUrl, API_HEADERS } from '../config/api';

// Create a centralized API client that handles authentication and token refresh
class ApiClient {
  constructor(authContext) {
    this.authContext = authContext;
  }

  async request(endpoint, options = {}) {
    const { method = 'GET', body, headers = {}, ...otherOptions } = options;

    // Get auth headers (with automatic refresh if needed)
    const authHeaders = await this.authContext.getAuthHeader();

    const requestOptions = {
      method,
      headers: {
        ...API_HEADERS,
        ...authHeaders,
        ...headers,
      },
      ...otherOptions,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(buildApiUrl(endpoint), requestOptions);

      // Handle unauthorized response (token might be invalid even after refresh)
      if (response.status === 401) {
        console.log('Received 401, attempting token refresh...');
        
        // Try to refresh token one more time
        const newToken = await this.authContext.refreshToken();
        
        if (newToken) {
          // Retry request with new token
          const newAuthHeaders = await this.authContext.getAuthHeader();
          requestOptions.headers = {
            ...API_HEADERS,
            ...newAuthHeaders,
            ...headers,
          };
          
          const retryResponse = await fetch(buildApiUrl(endpoint), requestOptions);
          
          if (!retryResponse.ok && retryResponse.status === 401) {
            // Still unauthorized after refresh, logout user
            this.authContext.logout();
            throw new Error('Session expired. Please login again.');
          }
          
          return retryResponse;
        } else {
          // Refresh failed, user will be logged out by refreshToken function
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }
}

export default ApiClient;