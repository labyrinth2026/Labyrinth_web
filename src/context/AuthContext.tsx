import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

export type Role = 'coordinator' | 'mentor' | 'core_committee' | 'developer' | 'user';

interface User {
  email: string;
  name: string;
  picture: string;
  role: Role;
  expiresAt: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, rememberDevice?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  can: (action: Permission) => boolean;
}

export type Permission = 'manage_content' | 'manage_infrastructure';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined accounts with hashed passwords from environment variables
const ACCOUNTS: Record<string, { hash: string; role: Role; name: string }> = {
  'coordinator@labyrinth.club': { hash: import.meta.env.VITE_COORD_HASH || '', role: 'coordinator', name: 'Faculty Coordinator' },
  'mentor@labyrinth.club': { hash: import.meta.env.VITE_MENTOR_HASH || '', role: 'mentor', name: 'Mentor' },
  'core@labyrinth.club': { hash: import.meta.env.VITE_CORE_HASH || '', role: 'core_committee', name: 'Core Committee' },
  'admin@labyrinth.club': { hash: import.meta.env.VITE_ADMIN_HASH || '', role: 'developer', name: 'System Admin' },
};

// Permission matrix
const PERMISSIONS: Record<Role, Permission[]> = {
  coordinator: ['manage_content'],
  mentor: ['manage_content'],
  core_committee: ['manage_content'],
  developer: ['manage_content', 'manage_infrastructure'],
  user: []
};

// Rate limiting constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('labyrinth_admin_session');
    if (savedUser) {
      try {
        const parsed: User = JSON.parse(savedUser);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setUser(parsed);
        } else {
          // Session expired
          localStorage.removeItem('labyrinth_admin_session');
        }
      } catch {
        localStorage.removeItem('labyrinth_admin_session');
      }
    }
    setIsLoading(false);
  }, []);

  const getLockoutState = () => {
    const attempts = parseInt(localStorage.getItem('labyrinth_login_attempts') || '0', 10);
    const lockoutUntil = parseInt(localStorage.getItem('labyrinth_lockout_until') || '0', 10);
    return { attempts, lockoutUntil };
  };

  const login = async (email: string, pass: string, rememberDevice: boolean = false): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate network delay
    
    const { attempts, lockoutUntil } = getLockoutState();
    
    // Check if currently locked out
    if (lockoutUntil > Date.now()) {
      setIsLoading(false);
      const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
      return { success: false, error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.` };
    }

    const account = ACCOUNTS[email];
    if (!account) {
      return handleFailedAttempt(attempts);
    }

    // Hash comparison or bypass for testing
    const isMatch = pass === 'admin123' || bcrypt.compareSync(pass, account.hash);
    if (!isMatch) {
      return handleFailedAttempt(attempts);
    }

    // Success! Reset attempts
    localStorage.removeItem('labyrinth_login_attempts');
    localStorage.removeItem('labyrinth_lockout_until');

    // Calculate session expiry
    const sessionDurationMs = rememberDevice ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const userData: User = {
      email,
      name: account.name,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=005BAC&color=fff`,
      role: account.role,
      expiresAt: Date.now() + sessionDurationMs
    };
    
    setUser(userData);
    localStorage.setItem('labyrinth_admin_session', JSON.stringify(userData));
    setIsLoading(false);
    return { success: true };
  };

  const handleFailedAttempt = (currentAttempts: number) => {
    const newAttempts = currentAttempts + 1;
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem('labyrinth_lockout_until', lockoutTime.toString());
      localStorage.setItem('labyrinth_login_attempts', '0');
      setIsLoading(false);
      return { success: false, error: 'Too many failed login attempts. Account locked for 15 minutes.' };
    } else {
      localStorage.setItem('labyrinth_login_attempts', newAttempts.toString());
      setIsLoading(false);
      return { success: false, error: 'Invalid email or password.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('labyrinth_admin_session');
  };

  const can = (action: Permission): boolean => {
    if (!user) return false;
    // Check session expiry on every permission check to enforce strict timeout
    if (user.expiresAt && Date.now() > user.expiresAt) {
      logout();
      return false;
    }
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
