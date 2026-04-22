import type { AuthService } from './authService';
import type { AuthCredentials, AuthResponse, RegisterData, User, UserPreferences } from '@/types/auth';

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

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** Hash a password using PBKDF2-SHA256. Returns 'salt:hash' in hex. */
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    HASH_BYTES * 8,
  );
  return `${bufToHex(salt)}:${bufToHex(derived)}`;
}

/** Verify a password against a stored 'salt:hash' string. */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = hexToBuf(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    HASH_BYTES * 8,
  );
  return bufToHex(derived) === hashHex;
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
    if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
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
      passwordHash: await hashPassword(data.password),
      emailVerified: true, // Auto-verified in local mode
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);
    const token = generateToken();
    setSession(newUser.id, token);
    return { user: toPublicUser(newUser), token };
  },

  async loginWithGoogle(_credential?: string, _acceptTerms?: boolean, _nonce?: string | null): Promise<AuthResponse> {
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

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<User> {
    const session = getSession();
    if (!session) throw new Error('Não autenticado.');
    const users = readUsers();
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx < 0) throw new Error('Usuário não encontrado.');
    
    users[idx].preferences = {
      ...users[idx].preferences,
      ...prefs
    };
    writeUsers(users);
    return toPublicUser(users[idx]);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const session = getSession();
    if (!session) throw new Error('Não autenticado.');
    const users = readUsers();
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx < 0) throw new Error('Usuário não encontrado.');
    if (!(await verifyPassword(currentPassword, users[idx].passwordHash))) {
      throw new Error('Senha atual incorreta.');
    }
    users[idx].passwordHash = await hashPassword(newPassword);
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

  async resendConfirmationEmail(_email: string): Promise<void> {
    // Auto-confirmed in local mode — no-op
  },
};
