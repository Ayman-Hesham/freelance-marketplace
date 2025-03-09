import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define types
interface User {
  id: string;
  name: string;
  email?: string;
  profilePicture?: string;
  role: 'client' | 'freelancer';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer';
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from API on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await axios.get('/api/users/me', { withCredentials: true });
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          profilePicture: data.profilePicture
        });
      } catch (err) {
        // User is not logged in or token is invalid - that's okay
        console.log('User not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};