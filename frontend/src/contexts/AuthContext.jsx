import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI, userAPI } from '../api/endpoints';
import { setTokens, clearTokens, getTokens } from '../api/client';
import { getApiErrorMessage } from '../utils/payloadValidator';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { accessToken } = getTokens();
      if (accessToken) {
        try {
          const response = await userAPI.getProfile();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          
          // Check if this is a demo user
          const email = response.data.email;
          setIsDemoUser(
            email === 'demo.customer@maidease.com' || 
            email === 'demo.maid@maidease.com'
          );
        } catch (err) {
          console.error('Failed to fetch user:', err);
          clearTokens();
          setUser(null);
          setIsDemoUser(false);
        }
      } else {
        // No token found, check if user data is in localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsDemoUser(
              userData.email === 'demo.customer@maidease.com' || 
              userData.email === 'demo.maid@maidease.com'
            );
          } catch {
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = useCallback(async (userData) => {
    try {
      console.log('🔐 AuthContext.register() called with:', userData);
      setError(null);
      console.log('🚀 Calling authAPI.register()...');
      const response = await authAPI.register(userData);
      console.log('✅ authAPI.register() returned:', response);
      setUser(response.data);
      setIsDemoUser(false);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      console.error('❌ Error in register():', err);
      const message = getApiErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);

      // Fetch user profile
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      // Check if demo user
      setIsDemoUser(
        email === 'demo.customer@maidease.com' || 
        email === 'demo.maid@maidease.com'
      );
      
      return userResponse.data;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const demoLogin = useCallback(async (role = 'customer') => {
    try {
      setError(null);
      const response = await authAPI.demoLogin(role);
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);

      // Fetch user profile
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data);
      setIsDemoUser(true);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      return userResponse.data;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setIsDemoUser(false);
    localStorage.removeItem('user');
  }, []);

  const updateProfile = useCallback((data) => {
    setUser((prev) => ({
      ...prev,
      ...data,
    }));
    localStorage.setItem('user', JSON.stringify(data));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        demoLogin,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
