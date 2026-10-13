import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ dashboardPath: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: Role) => Promise<string>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('alystro_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem('alystro_token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('alystro_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('alystro_token', res.data.token);
      setUser(res.data.user);
      return { dashboardPath: res.data.dashboardPath };
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('alystro_token');
      setUser(null);
    }
  };

  // Quick switcher for demo/testing convenience
  const switchDemoRole = async (targetRole: Role): Promise<string> => {
    const credentials: Record<Role, { email: string; pass: string }> = {
      SUPER_ADMIN: { email: 'superadmin@alystro.com', pass: 'Admin@123' },
      ADMIN: { email: 'operations@alystro.com', pass: 'Admin@123' },
      SCHOOL_ADMIN: { email: 'principal@abcschool.edu', pass: 'School@123' },
      TEACHER: { email: 'mentor.rohit@alystro.com', pass: 'Teacher@123' },
      STUDENT: { email: 'aarav.sharma@student.alystro.com', pass: 'Student@123' },
    };

    const cred = credentials[targetRole];
    if (cred) {
      const result = await login(cred.email, cred.pass);
      return result.dashboardPath;
    }
    return '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchDemoRole,
        refreshUser: fetchCurrentUser,
      }}
    >
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
