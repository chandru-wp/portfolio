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
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('AuthContext: Attempting login for:', username);
      const response = await authAPI.login(username, password);
      console.log('AuthContext: Login response:', response);
      
      const userData = {
        id: response.user.id,
        username: response.user.username,
        role: response.user.role
      };
      
      // Store JWT token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(response.token);
      setUser(userData);
      
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
      
      // Automatically log in user after registration
      const userData = {
        id: response.user.id,
        username: response.user.username,
        role: response.user.role
      };
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(response.token);
      setUser(userData);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
