import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('teenspend_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('teenspend_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token and fetch current user profile on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.data && response.data.data && response.data.data.user) {
          setUser(response.data.data.user);
          localStorage.setItem('teenspend_user', JSON.stringify(response.data.data.user));
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    const { user: loggedInUser, token: authToken } = response.data.data;

    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('teenspend_token', authToken);
    localStorage.setItem('teenspend_user', JSON.stringify(loggedInUser));

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await authApi.register({ name, email, password });
    const { user: registeredUser, token: authToken } = response.data.data;

    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem('teenspend_token', authToken);
    localStorage.setItem('teenspend_user', JSON.stringify(registeredUser));

    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('teenspend_token');
    localStorage.removeItem('teenspend_user');
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedUserData };
      localStorage.setItem('teenspend_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
