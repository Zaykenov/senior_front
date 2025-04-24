import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authService } from '../services/api';
import { initializeEcho, terminateEcho } from '../services/echo';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          initializeEcho(token);
          const resp = await authService.getProfile();
          setState({ user: resp.data, token, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('token');
          terminateEcho();
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await authService.login(email, password);
    const { token, user } = resp.data;
    localStorage.setItem('token', token);
    initializeEcho(token);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const resp = await authService.register(name, email, password, passwordConfirmation);
    const { token, user } = resp.data;
    localStorage.setItem('token', token);
    initializeEcho(token);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    try { await authService.logout(); } finally {
      localStorage.removeItem('token');
      terminateEcho();
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};