import type { AuthService } from './authService';
import type { AuthCredentials, AuthResponse, RegisterData, User } from '@/types/auth';

const BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'dnd_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body?.message ?? `Erro ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const apiAuthService: AuthService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const res = await authRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await authRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const res = await authRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    setAuthToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await authRequest<void>('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await authRequest<User>('/auth/me');
    } catch {
      clearAuthToken();
      return null;
    }
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User> {
    return authRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await authRequest<void>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await authRequest<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await authRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async confirmEmail(token: string): Promise<void> {
    await authRequest<void>('/auth/confirm-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async deleteAccount(): Promise<void> {
    await authRequest<void>('/auth/account', { method: 'DELETE' });
    clearAuthToken();
  },
};
