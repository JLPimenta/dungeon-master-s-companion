import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { AuthCredentials, RegisterData, User } from '@/types/auth';
import { getAuthService } from '@/services/authServiceProvider';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'name' | 'avatarUrl'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const service = getAuthService();

  useEffect(() => {
    service.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const res = await service.login(credentials);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await service.register(data);
    setUser(res.user);
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await service.loginWithGoogle(credential);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await service.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<Pick<User, 'name' | 'avatarUrl'>>) => {
    const updated = await service.updateProfile(data);
    setUser(updated);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await service.changePassword(currentPassword, newPassword);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await service.requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await service.resetPassword(token, newPassword);
  }, []);

  const confirmEmail = useCallback(async (token: string) => {
    await service.confirmEmail(token);
  }, []);

  const deleteAccount = useCallback(async () => {
    await service.deleteAccount();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        confirmEmail,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
