import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { storage } from '../utils/storage';
import { track } from '../services/tracking';

const AuthContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = storage.get('auth_token');
      if (token) {
        const userData = await authService.getCurrentCustomer();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      storage.remove('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const timer = setTimeout(() => checkAuthStatus(), 0);
    return () => clearTimeout(timer);
  }, []);

  // The authenticated event also links this browser's previous guest cart
  // additions to the verified customer profile on the server.
  useEffect(() => {
    if (isAuthenticated) track('PAGE_VIEW', { path: window.location.pathname });
  }, [isAuthenticated]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(username, password);
      
      if (response.token) {
        storage.set('auth_token', response.token);
        const userData = await authService.getCurrentCustomer();
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(email, password, firstName, lastName);
      
      if (response.id) {
        // Auto-login after registration
        const loginResult = await login(email, password);
        return loginResult;
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      storage.remove('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const updateProfile = async (customerData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateCustomer(customerData);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Profile update failed');
      return { success: false, error: err.response?.data?.message || 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.forgotPassword(email);
      return { success: true, resetToken: response.resetToken };
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Password reset failed');
      return { success: false, error: err.response?.data?.message || 'Password reset failed' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (key, password) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(key, password);
      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Password reset failed');
      return { success: false, error: err.response?.data?.message || 'Password reset failed' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    refreshAuth: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
/* eslint-enable react-refresh/only-export-components */
