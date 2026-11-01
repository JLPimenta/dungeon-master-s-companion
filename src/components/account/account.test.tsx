import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PasswordInput } from './ui';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { systemsSentence } from '@/pages/Index';
import { initialsOf } from '@/components/AppHeader';

// O Checkbox do Radix mede o tamanho com ResizeObserver, que o jsdom não tem.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

const auth = {
  register: vi.fn(), loginWithGoogle: vi.fn(), login: vi.fn(),
  user: { name: 'João Luiz', email: 'joao@exemplo.com' },
  updateProfile: vi.fn(), changePassword: vi.fn(), deleteAccount: vi.fn(), logout: vi.fn(),
  updatePreferences: vi.fn(),
};
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('react-google-recaptcha', () => ({ default: () => <div data-testid="recaptcha" /> }));
vi.mock('@react-oauth/google', () => ({ GoogleLogin: () => <div data-testid="google" /> }));
vi.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: () => ({ preferences: { theme: 'dark', autoSave: false }, updatePreferences: auth.updatePreferences, autoSaveEnabled: false, currentTheme: 'dark' }),
}));

describe('peças das telas de conta', () => {
  it('mostrar/ocultar senha troca o tipo do campo e o rótulo', () => {
    render(<PasswordInput aria-label="Senha" defaultValue="segredo" />);
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('indicador de força mantém os textos da v1', () => {
    render(<PasswordStrengthIndicator password="Grimor" />);
    expect(screen.getByText('Média')).toBeInTheDocument();
    for (const rule of ['Mínimo 8 caracteres', 'Letra maiúscula', 'Letra minúscula', 'Número']) {
      expect(screen.getByText(rule)).toBeInTheDocument();
    }
  });

  it('subtítulo do Início lista os sistemas do registro', () => {
    expect(systemsSentence(['D&D 5.5e', 'Tormenta20', 'D&D 5e'])).toBe('D&D 5.5e, Tormenta20 e D&D 5e');
    expect(systemsSentence(['D&D 5.5e'])).toBe('D&D 5.5e');
  });

  it('iniciais do botão do usuário', () => {
    expect(initialsOf('João Luiz Pimenta')).toBe('JL');
    expect(initialsOf('  ')).toBe('U');
    expect(initialsOf(undefined)).toBe('U');
  });
});

describe('Criar conta', () => {
  it('avisa "As senhas não coincidem." enquanto digita a confirmação', async () => {
    const { default: Register } = await import('@/pages/Register');
    render(<MemoryRouter><Register /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Grimorio1' } });
    expect(screen.queryByText('As senhas não coincidem.')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: 'Grimorio' } });
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: 'Grimorio1' } });
    expect(screen.queryByText('As senhas não coincidem.')).not.toBeInTheDocument();
    // "Criar Conta" só libera com reCAPTCHA e termos (regra da v1).
    expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeDisabled();
  });
});

describe('Meu Perfil', () => {
  it('tema em três opções e a nota do salvamento automático', async () => {
    const { default: Profile } = await import('@/pages/Profile');
    render(<MemoryRouter><Profile /></MemoryRouter>);
    const group = screen.getByRole('radiogroup', { name: 'Tema Visual' });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Escuro/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: /Claro/ }));
    expect(auth.updatePreferences).toHaveBeenCalledWith({ theme: 'light' });
    expect(screen.getByText(/Desligado, a ficha pergunta/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByText('O email não pode ser alterado.')).toBeInTheDocument();
  });
});
