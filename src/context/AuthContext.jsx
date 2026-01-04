import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('AuthContext: Attempting login for:', username);
      const response = await authAPI.login(username, password);
      console.log('AuthContext: Login response:', response);
      const userData = {
        username: response.username,
        role: response.role
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, data: response };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (username, password, role = 'user') => {
    try {
      console.log('AuthContext: Attempting registration for:', username, 'with role:', role);
      const response = await authAPI.register(username, password, role);
      console.log('AuthContext: Registration response:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
