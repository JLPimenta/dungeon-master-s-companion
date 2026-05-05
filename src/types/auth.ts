export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
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
