

# Plano: Autenticacao, Perfil e Recuperacao de Senha

## Visao Geral

Implementar autenticacao completa (email/senha + Google) com confirmacao de email, recuperacao de senha e tela de perfil. Seguindo o padrao existente: camada de servico abstraida (interface + implementacoes local/API).

## Correcao pre-requisito

O build error atual (`'save' does not exist in type 'CharacterService'`) sera corrigido renomeando `save` para `create`/`update` no `localStorageService.ts`, alinhando com a interface.

## Arquitetura

```text
src/
├── types/
│   └── auth.ts                    # User, AuthCredentials, AuthState
├── services/
│   ├── authService.ts             # Interface AuthService
│   ├── localAuthService.ts        # Implementacao localStorage (guest)
│   ├── apiAuthService.ts          # Implementacao API REST
│   └── authServiceProvider.ts     # Factory (mesmo padrao serviceProvider.ts)
├── contexts/
│   └── AuthContext.tsx             # Context + Provider global
├── hooks/
│   └── useAuth.ts                 # Hook consumidor do context
├── pages/
│   ├── Login.tsx                  # Sign In (email/senha + Google)
│   ├── Register.tsx               # Sign Up (nome, email, senha)
│   ├── ForgotPassword.tsx         # Solicitar reset de senha
│   ├── ResetPassword.tsx          # Definir nova senha (via token)
│   ├── ConfirmEmail.tsx           # Pagina de confirmacao de email
│   └── Profile.tsx                # Ver/editar perfil, excluir conta
├── components/auth/
│   ├── AuthLayout.tsx             # Layout compartilhado (logo, card central)
│   ├── ProtectedRoute.tsx         # Wrapper que redireciona se nao logado
│   └── GoogleSignInButton.tsx     # Botao padrao Google
```

## 1. Tipos (`src/types/auth.ts`)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface RegisterData extends AuthCredentials {
  name: string;
}
```

## 2. Interface do Servico (`src/services/authService.ts`)

```typescript
interface AuthService {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  loginWithGoogle(): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(data: Partial<User>): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  confirmEmail(token: string): Promise<void>;
  deleteAccount(): Promise<void>;
}
```

## 3. Implementacao Local (`localAuthService.ts`)

- Armazena usuario no localStorage (modo guest/offline)
- `login`/`register` simulam autenticacao local
- Permite uso do app sem backend (como ja funciona hoje)

## 4. Implementacao API (`apiAuthService.ts`)

- Chama endpoints REST do backend NestJS
- Armazena token JWT no localStorage
- Injeta `Authorization: Bearer <token>` nas requisicoes

## 5. AuthContext + Provider

- Gerencia estado global: `user`, `isAuthenticated`, `isLoading`
- Inicializa verificando sessao existente (token salvo)
- Envolve o App inteiro

## 6. Paginas

### Login (`/login`)
- Formulario: Email + Senha
- Botao `[Entrar]`
- Botao `[Entrar com Google]` (estilo padrao Google)
- Link "Esqueceu sua senha?" → `/forgot-password`
- Link "Nao tem conta? Criar conta" → `/register`

### Register (`/register`)
- Formulario: Nome + Email + Senha + Confirmar Senha
- Botao `[Criar Conta]`
- Botao `[Registrar com Google]`
- Apos sucesso: redireciona para `/confirm-email` com mensagem

### Confirmar Email (`/confirm-email`)
- Recebe token via query param
- Chama `authService.confirmEmail(token)`
- Exibe mensagem de sucesso/erro
- Link para `/login`

### Esqueci a Senha (`/forgot-password`)
- Campo Email + Botao `[Enviar Link de Recuperacao]`
- Exibe mensagem "Verifique seu email"

### Redefinir Senha (`/reset-password`)
- Recebe token via query param
- Campos: Nova Senha + Confirmar Senha
- Botao `[Redefinir Senha]`
- Redireciona para `/login` apos sucesso

### Perfil (`/profile`)
- Exibe e edita: Nome, Email (somente leitura), Avatar
- Secao Alterar Senha: Senha Atual + Nova Senha + Confirmar
- Botao `[Salvar Alteracoes]`
- Zona de perigo: Botao `[Excluir Minha Conta]` com dialog de confirmacao

## 7. Rotas Protegidas

- `ProtectedRoute` envolve rotas que exigem login (`/`, `/character/:id`, `/profile`)
- Rotas publicas: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/confirm-email`
- Se `VITE_USE_API=false`, o ProtectedRoute permite acesso livre (modo guest)

## 8. Integracao com CharacterService

- Quando logado via API, o backend filtra fichas por usuario (o token JWT identifica o dono)
- No modo local, tudo continua como hoje (sem filtro)
- A `apiService` precisa incluir o header `Authorization` — sera extraido do `authServiceProvider`

---

## O que precisa ser feito no Backend (NestJS)

O frontend chamara os seguintes endpoints. Voce precisara implementa-los:

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastro (name, email, password). Envia email de confirmacao |
| POST | `/api/auth/login` | Login email/senha. Retorna JWT |
| POST | `/api/auth/google` | Login/registro via Google OAuth (recebe token do Google) |
| POST | `/api/auth/logout` | Invalida sessao/token |
| GET | `/api/auth/me` | Retorna usuario logado (via JWT) |
| POST | `/api/auth/confirm-email` | Confirma email via token |
| POST | `/api/auth/forgot-password` | Envia email com link de reset |
| POST | `/api/auth/reset-password` | Redefine senha via token |
| PUT | `/api/auth/profile` | Atualiza nome/avatar do usuario |
| PUT | `/api/auth/change-password` | Altera senha (currentPassword + newPassword) |
| DELETE | `/api/auth/account` | Exclui conta e todas as fichas do usuario |

### Detalhes importantes para o backend:
- **JWT**: Gerar token com `userId` no payload, validar em middleware
- **Google OAuth**: Receber o `credential` (ID token) do Google, validar com a lib do Google, criar/vincular usuario
- **Confirmacao de email**: Gerar token unico, enviar email com link `{FRONTEND_URL}/confirm-email?token=xxx`
- **Reset de senha**: Gerar token com expiracao (ex: 1h), enviar email com link `{FRONTEND_URL}/reset-password?token=xxx`
- **Excluir conta**: Cascade delete em todas as fichas do usuario
- **GET `/api/characters`**: Filtrar por `userId` extraido do JWT

