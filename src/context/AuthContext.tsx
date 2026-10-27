import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession, UserRole, ApprovalStatus } from '../types';
import { getStoredSession, logoutUser as logoutService } from '../services/authService';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  setSession: (s: AuthSession | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(getStoredSession());

  useEffect(() => {
    const s = getStoredSession();
    setSessionState(s);
  }, []);

  const setSession = useCallback((s: AuthSession | null) => {
    setSessionState(s);
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setSessionState(null);
  }, []);

  const isAuthenticated = !!session;
  const isApproved = session?.approvalStatus === 'APPROVED';
  const isAdmin = session?.role === 'ADMIN';
  const isDoctor = session?.role === 'DOCTOR';

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        isApproved,
        isAdmin,
        isDoctor,
        setSession,
        logout,
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
