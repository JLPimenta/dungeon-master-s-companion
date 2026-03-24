import type { AuthService } from './authService';
import type { AuthCredentials, AuthResponse, RegisterData, User } from '@/types/auth';

const USERS_KEY = 'dnd_auth_users';
const SESSION_KEY = 'dnd_auth_session';

interface StoredUser extends User {
  passwordHash: string;
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): { userId: string; token: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(userId: string, token: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, token }));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

function simpleHash(password: string): string {
  // Simple hash for local-only use (NOT secure for production)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function generateToken(): string {
  return crypto.randomUUID();
}

function toPublicUser(stored: StoredUser): User {
  const { passwordHash: _, ...user } = stored;
  return user;
}

export const localAuthService: AuthService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const users = readUsers();
    const user = users.find(u => u.email === credentials.email);
    if (!user || user.passwordHash !== simpleHash(credentials.password)) {
      throw new Error('Email ou senha incorretos.');
    }
    const token = generateToken();
    setSession(user.id, token);
    return { user: toPublicUser(user), token };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const users = readUsers();
    if (users.some(u => u.email === data.email)) {
      throw new Error('Este email já está em uso.');
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: simpleHash(data.password),
      emailVerified: true, // Auto-verified in local mode
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);
    const token = generateToken();
    setSession(newUser.id, token);
    return { user: toPublicUser(newUser), token };
  },

  async loginWithGoogle(): Promise<AuthResponse> {
    throw new Error('Login com Google não disponível no modo offline.');
  },

  async logout(): Promise<void> {
    clearSession();
  },

  async getCurrentUser(): Promise<User | null> {
    const session = getSession();
    if (!session) return null;
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    return user ? toPublicUser(user) : null;
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User> {
    const session = getSession();
    if (!session) throw new Error('Não autenticado.');
    const users = readUsers();
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx < 0) throw new Error('Usuário não encontrado.');
    users[idx] = { ...users[idx], ...data };
    writeUsers(users);
    return toPublicUser(users[idx]);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const session = getSession();
    if (!session) throw new Error('Não autenticado.');
    const users = readUsers();
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx < 0) throw new Error('Usuário não encontrado.');
    if (users[idx].passwordHash !== simpleHash(currentPassword)) {
      throw new Error('Senha atual incorreta.');
    }
    users[idx].passwordHash = simpleHash(newPassword);
    writeUsers(users);
  },

  async requestPasswordReset(_email: string): Promise<void> {
    // In local mode, just simulate success
  },

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    throw new Error('Recuperação de senha não disponível no modo offline.');
  },

  async confirmEmail(_token: string): Promise<void> {
    // Auto-confirmed in local mode
  },

  async deleteAccount(): Promise<void> {
    const session = getSession();
    if (!session) throw new Error('Não autenticado.');
    const users = readUsers();
    writeUsers(users.filter(u => u.id !== session.userId));
    clearSession();
  },
};
