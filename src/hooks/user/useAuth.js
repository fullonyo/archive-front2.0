import { useState, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { userService } from '../../services/userService';

export const useAuth = () => {
  const { 
    isAuthenticated, 
    loading, 
    error, 
    login: contextLogin, 
    logout: contextLogout, 
    register: contextRegister 
  } = useUser();
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const login = useCallback(async (credentials) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const result = await contextLogin(credentials);
      
      if (result.success) {
        // Login successful, context will update automatically
        return { success: true };
      } else {
        setAuthError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, [contextLogin]);

  const register = useCallback(async (userData) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const result = await contextRegister(userData);
      
      if (result.success) {
        return { success: true };
      } else {
        setAuthError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, [contextRegister]);

  const logout = useCallback(() => {
    contextLogout();
    setAuthError(null);
  }, [contextLogout]);

  const forgotPassword = useCallback(async (email) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await userService.requestPasswordReset(email);
      return { success: true, message: 'Password reset email sent' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to send password reset email';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await userService.resetPassword(token, newPassword);
      return { success: true, message: 'Password reset successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to reset password';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await userService.changePassword(user.id, {
        currentPassword,
        newPassword
      });
      return { success: true, message: 'Password changed successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to change password';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    // State
    isAuthenticated,
    loading: loading || authLoading,
    error: error || authError,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError
  };
};