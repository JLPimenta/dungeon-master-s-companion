import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { GrimorioMark } from '@/components/brand/GrimorioMark';
import { useAuth } from '@/hooks/useAuth';
import { LogoutDialog } from '@/components/auth/LogoutDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Iniciais do nome para o botão do usuário ("João Luiz" → "JL"). */
// eslint-disable-next-line react-refresh/only-export-components
export function initialsOf(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'U';
}

/** Cabeçalho do Início (redesign v2): marca à esquerda, menu do usuário à direita. */
export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface">
      <div className="mx-auto flex h-[60px] max-w-5xl items-center gap-3 px-4">
        <Link
          to="/"
          aria-label="Grimório — início"
          className="flex items-center gap-2.5 rounded-md text-primary-text transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <GrimorioMark size={30} />
          <span className="font-heading text-lg font-bold tracking-[0.06em]">Grimório</span>
        </Link>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Menu de ${user?.name ?? 'usuário'}`}
              className="flex h-11 items-center gap-2 rounded-full border border-border pl-1 pr-2.5 text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-secondary"
            >
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary font-heading text-[13px] font-bold text-primary-foreground">
                {initialsOf(user?.name)}
              </span>
              <span className="hidden max-w-[160px] truncate text-base sm:block">{user?.name ?? 'Usuário'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-60 rounded-xl border-border bg-card p-1.5">
            <DropdownMenuLabel className="truncate px-2.5 py-2 text-sm font-normal text-muted-foreground">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="h-11 cursor-pointer gap-2.5 rounded-md px-2.5 text-base">
              <User className="h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* O item abre o diálogo de confirmação da v1. */}
            <LogoutDialog>
              <DropdownMenuItem
                className="h-11 cursor-pointer gap-2.5 rounded-md px-2.5 text-base text-danger-text focus:text-danger-text"
                onSelect={e => e.preventDefault()}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </LogoutDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
