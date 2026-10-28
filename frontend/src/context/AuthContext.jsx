import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { TOKEN_KEY, USER_KEY, clearSession } from '../api/client';

const AuthContext = createContext(null);

// Reads the JWT's exp claim (no signature check; the server does that) so a stale token
// is dropped on load instead of failing the first request after a long absence.
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const readSavedToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    clearSession('Your session has expired. Please sign in again.');
    return null;
  }
  return token;
};

const readSavedUser = () => {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(readSavedToken);
  const [user, setUser] = useState(() => (readSavedToken() ? readSavedUser() : null));
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
        localStorage.setItem(TOKEN_KEY, response.token);

        // Save email & display user info
        const normalizedEmail = email.trim().toLowerCase();
        const userData = { email: normalizedEmail, name: normalizedEmail.split('@')[0] };
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
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
    clearSession();
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
