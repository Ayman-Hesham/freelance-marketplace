import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createUser, getCurrentUser, loginUser, logoutUser } from '../services/apiService';
import { RegistrationForm, LoginForm, AuthContextType, User } from '../types/auth.types';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
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
  const [success, setSuccess] = useState<string | null>(null);

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

  const register = async (userData: RegistrationForm): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createUser(userData);
      if ('status' in response) {
        setError(response.message);
        return response.message;
      }
      setSuccess(response.message);
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return errorMessage;
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

  const clearToast = () => {
    setError(null);
    setSuccess(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    success,
    login,
    register,
    logout,
    clearToast
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

