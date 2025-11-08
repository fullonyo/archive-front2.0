import axios from 'axios';
import logService from '../services/logService';

/**
 * API Configuration with Advanced Error Handling
 * 
 * Features:
 * 1. Auto Token Refresh (401 errors)
 * 2. Retry Logic with Exponential Backoff (5xx errors)
 *    - Max 3 retries
 *    - Delays: 1s, 2s, 4s (exponential)
 *    - Retries on: 500, 502, 503, 504
 * 3. Comprehensive error handling
 * 4. Structured logging
 */

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors AND auto-refresh tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          logService.warn('No refresh token available, redirecting to login');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        logService.info('Refreshing expired token...');
        
        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
        
        // Update tokens
        localStorage.setItem('auth_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
        
        logService.info('Token refreshed successfully');
        
        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry original request
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect
        logService.error('Token refresh failed', { error: refreshError.message });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Retry logic for 5xx server errors (500, 502, 503, 504)
    const shouldRetry = error.response?.status >= 500 && error.response?.status <= 504;
    const retryCount = originalRequest._retryCount || 0;
    const maxRetries = 3;

    if (shouldRetry && retryCount < maxRetries) {
      originalRequest._retryCount = retryCount + 1;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;

      console.warn(
        `[Retry ${retryCount + 1}/${maxRetries}] Request failed with ${error.response?.status}. ` +
        `Retrying in ${delay}ms...`,
        originalRequest.url
      );

      // Wait for delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry the request
      return api(originalRequest);
    }

    // Max retries exceeded or non-retryable error
    if (shouldRetry && retryCount >= maxRetries) {
      logService.error(
        `Max retries (${maxRetries}) exceeded`,
        { 
          url: originalRequest.url,
          method: originalRequest.method,
          status: error.response?.status
        }
      );
    }
    
    // Handle other error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      // Log API error
      logService.logApiError(originalRequest.url, error, {
        method: originalRequest.method,
        status
      });
      
      switch (status) {
        case 403:
          // Forbidden
          throw new Error(data.message || 'Access forbidden');
        case 404:
          // Not found
          throw new Error(data.message || 'Resource not found');
        case 422:
          // Validation error
          throw new Error(data.message || 'Validation failed');
        case 429:
          // Rate limit exceeded
          throw new Error(data.message || 'Too many requests. Please try again later.');
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors (after retries exhausted)
          throw new Error(data.message || 'Server error. Please try again later.');
        default:
          throw new Error(data.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error
      logService.error('Network error', { url: originalRequest.url });
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      // Other error
      logService.error('Unexpected error', { error: error.message });
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export default api;