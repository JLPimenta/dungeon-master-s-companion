import type { AuthCredentials, AuthResponse, RegisterData, User } from '@/types/auth';

export interface AuthService {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  loginWithGoogle(credential: string, acceptTerms?: boolean): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(data: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  confirmEmail(token: string): Promise<void>;
  deleteAccount(): Promise<void>;
}
