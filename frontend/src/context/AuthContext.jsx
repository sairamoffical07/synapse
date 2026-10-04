import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('synapse_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synapse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('synapse_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('synapse_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem('synapse_token', response.token);

        // Save email & display user info
        const userData = { email, name: email.split('@')[0] };
        setUser(userData);
        localStorage.setItem('synapse_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Authentication error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, university, course, year) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        fullName,
        email,
        password,
        university,
        course,
        year: year ? parseInt(year, 10) : 1,
      });

      if (response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
