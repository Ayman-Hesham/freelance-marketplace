import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createUser, getCurrentUser, loginUser, logoutUser } from '../services/apiService';
import { RegistrationForm, LoginForm, AuthContextType, User } from '../types/auth.types';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await getCurrentUser();    
        if ('message' in response) {
          console.log('Not authenticated or server error');
          return;
        }   
        setUser(response);
      } catch (err) {
        console.log('Not authenticated or server error');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (loginData: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(loginData);
      if ('message' in response) {
        setError(response.message);
        return;
      }
      setUser(response);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegistrationForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createUser(userData);
      if ('status' in response) {
        setError(response.message);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

