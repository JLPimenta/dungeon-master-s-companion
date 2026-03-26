import { useNavigate } from 'react-router-dom';
import { Scroll, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogoutDialog } from '@/components/auth/LogoutDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Scroll className="h-5 w-5 text-primary" />
          <span
            className="text-base font-semibold tracking-wide text-primary"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Grimório
          </span>
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-9 items-center gap-2 px-2 hover:bg-secondary"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </span>
              <span className="hidden max-w-[140px] truncate text-sm text-foreground sm:block">
                {user?.name ?? 'Usuário'}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer gap-2">
              <User className="h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Logout wrapped in dialog — DropdownMenuItem acts as trigger */}
            <LogoutDialog>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
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
