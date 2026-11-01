import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  AccountField, PasswordInput, accountInput, dangerButton, dangerDialogContent, dialogCancel, dialogConfirm,
  dialogDescription, dialogFooter, dialogTitle, outlineButton, primaryButton, sectionTitle,
} from '@/components/account/ui';
import { PasswordStrengthIndicator, isPasswordStrong } from '@/components/auth/PasswordStrengthIndicator';
import { LogoutDialog } from '@/components/auth/LogoutDialog';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Switch } from '@/components/ui/switch';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, Laptop, Moon, Sun } from 'lucide-react';

const THEMES = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Laptop },
] as const;

const card = 'rounded-xl border border-hairline bg-card px-5 py-[18px]';
const saveButton = cn(primaryButton, 'h-[46px] self-start text-[13px]');

export default function Profile() {
  const { preferences, updatePreferences, autoSaveEnabled, currentTheme } = useUserPreferences();
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);
  // v2: avisa a diferença enquanto digita; a validação no envio continua.
  const mismatch = !!confirmNewPassword && confirmNewPassword !== newPassword;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name });
      toast({ title: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong(newPassword)) {
      toast({ title: 'Senha fraca', description: 'A nova senha não atende todos os requisitos.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({ title: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast({ title: 'Conta excluída.' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      setDeleting(false);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-[672px] flex-col gap-5 px-4 pb-16 pt-5">
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            aria-label="Voltar ao início"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-heading text-2xl font-bold tracking-[0.04em] text-primary-text">Meu Perfil</h1>
        </div>

        {/* Informações pessoais */}
        <section className={card} aria-labelledby="profile-info">
          <h2 id="profile-info" className={cn(sectionTitle, 'mb-3.5')}>Informações Pessoais</h2>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5">
            <AccountField label="Nome" htmlFor="name">
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={accountInput}
              />
            </AccountField>
            <AccountField label="Email" htmlFor="email" hint="O email não pode ser alterado.">
              <Input
                id="email"
                value={user?.email ?? ''}
                disabled
                className={accountInput}
              />
            </AccountField>
            <button type="submit" disabled={saving} className={saveButton}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </section>

        {/* Alterar senha */}
        <section className={card} aria-labelledby="profile-password">
          <h2 id="profile-password" className={cn(sectionTitle, 'mb-3.5')}>Alterar Senha</h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5">
            <AccountField label="Senha Atual" htmlFor="currentPassword">
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </AccountField>
            <AccountField label="Nova Senha" htmlFor="newPassword">
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                placeholder="Crie uma senha forte"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <PasswordStrengthIndicator password={newPassword} />
            </AccountField>
            <AccountField label="Confirmar Nova Senha" htmlFor="confirmNewPassword" error={mismatch && 'As senhas não coincidem.'}>
              <PasswordInput
                id="confirmNewPassword"
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                aria-invalid={mismatch || undefined}
                required
              />
            </AccountField>
            <button type="submit" disabled={changingPassword} className={saveButton}>
              {changingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </section>

        {/* Configurações */}
        <section className={card} aria-labelledby="profile-settings">
          <h2 id="profile-settings" className={cn(sectionTitle, 'mb-3.5')}>Configurações</h2>
          <div className="flex items-center gap-3.5">
            <div className="flex-1">
              <label htmlFor="autosave" id="autosave-label" className="block text-[17px] font-semibold">Salvamento Automático</label>
              <p id="autosave-desc" className="text-[15px] text-muted-foreground">
                Salva automaticamente as alterações da ficha de personagem no servidor.
                Desligado, a ficha pergunta “deseja salvá-las?” a cada alteração.
              </p>
            </div>
            <Switch
              id="autosave"
              aria-describedby="autosave-desc"
              checked={autoSaveEnabled}
              onCheckedChange={checked => updatePreferences({ autoSave: checked })}
              className="h-7 w-12 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:translate-x-5"
            />
          </div>

          <div className="my-[18px] h-px bg-hairline" />

          <div id="theme-label" className="mb-2 text-[17px] font-semibold">Tema Visual</div>
          <div role="radiogroup" aria-labelledby="theme-label" className="grid grid-cols-3 gap-2">
            {THEMES.map(t => {
              const on = currentTheme === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => updatePreferences({ theme: t.value })}
                  className={cn(
                    'flex h-[46px] items-center justify-center gap-2 rounded-lg border text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    on ? 'border-primary bg-primary/10 font-semibold text-primary-text' : 'border-border text-foreground hover:bg-secondary',
                  )}
                >
                  <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Claro usa o pergaminho; Escuro, o couro e ferro. Sistema segue o aparelho.
          </p>
        </section>

        <div className="h-px bg-hairline" />

        {/* Ações */}
        <div className="flex flex-wrap justify-between gap-2.5">
          <LogoutDialog>
            <button type="button" className={outlineButton}>Sair da Conta</button>
          </LogoutDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className={dangerButton}>
                <Trash2 />
                Excluir Minha Conta
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className={cn(dangerDialogContent, 'max-w-[440px]')}>
              <AlertDialogHeader className="space-y-0 text-left">
                <AlertDialogTitle className={cn(dialogTitle, 'text-danger-text')}>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription className={dialogDescription}>
                  Esta ação é irreversível. Todos os seus dados, incluindo fichas de personagem,
                  serão permanentemente excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className={dialogFooter}>
                <AlertDialogCancel className={dialogCancel}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className={cn(dialogConfirm, 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
                >
                  {deleting ? 'Excluindo...' : 'Sim, excluir minha conta'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
