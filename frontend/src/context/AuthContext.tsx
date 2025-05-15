import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createUser, loginUser } from '../services/auth.service';
import { updateProfile, logoutUser } from '../services/user.service';
import { RegistrationForm, LoginForm, User } from '../types/auth.types';

interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  login: (loginData: LoginForm) => Promise<void>;
  register: (userData: RegistrationForm) => Promise<string | null>;
  logout: () => Promise<void>;
  updateUser: (formData: FormData) => Promise<void>;
  clearToast: () => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const updateUser = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateProfile(formData);
      if ('message' in response) {
        setError(response.message);
        return;
      }
      
      setUser(prevUser => ({
        ...prevUser,
        ...response,
        role: prevUser?.role,
        id: prevUser?.id || ''
      }));
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      clearToast();
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
    updateUser,
    clearToast
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

