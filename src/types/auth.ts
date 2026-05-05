export interface UserPreferences {
  autoSave: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  autoSave: false,
  theme: 'system',
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  preferences?: Partial<UserPreferences>;
}

export interface AuthCredentials {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  captchaToken?: string;
  acceptTerms?: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
