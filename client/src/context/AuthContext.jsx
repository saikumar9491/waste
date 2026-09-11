import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wastewise_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('wastewise_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success('Welcome back, ' + data.user.name + '!');
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      if (data.success) {
        localStorage.setItem('wastewise_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success('Registration successful! +50 Welcome Eco Points 🌱');
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const demoLogin = async (role) => {
    try {
      const { data } = await api.post('/auth/demo-login', { role });
      if (data.success) {
        localStorage.setItem('wastewise_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success('Switched to ' + role.toUpperCase() + ' (' + data.user.name + ')');
        return { success: true, user: data.user };
      }
    } catch (err) {
      toast.error('Demo login failed');
      return { success: false };
    }
  };

  const googleLogin = async ({ credential, accessToken, role, isDemo, demoProfile }) => {
    try {
      const { data } = await api.post('/auth/google', { credential, accessToken, role, isDemo, demoProfile });
      if (data.success) {
        localStorage.setItem('wastewise_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome, ${data.user.name}! Signed in with Google 🌱`);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('wastewise_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) setUser(data.user);
    } catch (err) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, googleLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
