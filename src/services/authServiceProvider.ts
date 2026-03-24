import type { AuthService } from './authService';
import { localAuthService } from './localAuthService';
import { apiAuthService } from './apiAuthService';

export function getAuthService(): AuthService {
  return import.meta.env.VITE_USE_API === 'true'
    ? apiAuthService
    : localAuthService;
}
