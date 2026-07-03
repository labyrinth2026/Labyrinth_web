"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Simplified roles: ADMIN and MEMBER
export type Role = 'ADMIN' | 'MEMBER';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  firstLogin?: boolean;
  committeeId?: string;
  verticalId?: string;
}

export type Permission = 
  | 'manage_content'
  | 'manage_infrastructure'
  | 'manage_events'
  | 'manage_verticals'
  | 'manage_team'
  | 'view_registrations'
  | 'review_content'
  | 'manage_roles';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, portalType?: 'admin' | 'core' | 'vertical') => Promise<{ success: boolean; user?: User; mustReset?: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  can: (action: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple permission mapping: ADMIN has all rights, MEMBER has none
const PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'manage_content',
    'manage_infrastructure',
    'manage_events',
    'manage_verticals',
    'manage_team',
    'view_registrations',
    'review_content',
    'manage_roles'
  ],
  MEMBER: []
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current session on load
  const loadSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('[AuthContext] Load session failed:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (email: string, pass: string, portalType?: 'admin' | 'core' | 'vertical'): Promise<{ success: boolean; user?: User; mustReset?: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, portalType })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setIsLoading(false);
        return { success: true, user: data.user, mustReset: data.mustReset };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Invalid credentials.' };
      }
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      console.error('[AuthContext] Logout failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const can = (action: Permission): boolean => {
    if (!user) return false;
    const perms = PERMISSIONS[user.role] || [];
    return perms.includes(action);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
