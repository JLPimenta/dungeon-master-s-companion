import { forwardRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/*
 * Peças visuais do Início e das telas de conta (docs/redesign-v2/04-inicio-e-contas.md).
 * Só aparência: a lógica continua nas páginas da v1.
 */

/** Campo de 46 px com texto de 16 px (evita o zoom automático do iOS). */
export const accountInput =
  'h-[46px] rounded-lg border-border/70 bg-card px-3 dark:bg-background text-base md:text-base placeholder:text-muted-foreground/70 ' +
  'focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-secondary dark:disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100';

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-lg transition-[background-color,opacity,transform] active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0';

/** Botão dourado cheio (ação principal). */
export const primaryButton =
  `${btnBase} h-12 bg-primary px-5 font-heading text-sm font-bold tracking-[0.06em] text-primary-foreground hover:bg-primary/90`;

/** Botão com contorno (ação secundária). */
export const outlineButton =
  `${btnBase} h-[46px] border border-border/70 bg-transparent px-4 text-base text-foreground hover:bg-secondary`;

/** Botão destrutivo cheio. */
export const dangerButton =
  `${btnBase} h-[46px] bg-destructive px-4 text-base font-semibold text-destructive-foreground hover:bg-destructive/90`;

/** Diálogos (criar, excluir, sair, Google): cartão com borda dourada, título em Cinzel. */
export const dialogContent = 'w-[calc(100%-32px)] gap-0 rounded-xl border-primary/40 bg-card p-5 sm:rounded-xl';
export const dangerDialogContent = 'w-[calc(100%-32px)] gap-0 rounded-xl border-destructive/50 bg-card p-5 sm:rounded-xl';
export const dialogTitle = 'font-heading text-lg font-bold tracking-normal text-primary-text';
export const dialogDescription = 'mt-2 text-base text-foreground/85';
export const dialogFooter = 'mt-5 gap-2 sm:space-x-0';
/** Botões dos diálogos: 44 px de altura. */
export const dialogCancel =
  'mt-0 h-11 rounded-lg border-border/70 bg-transparent px-4 text-base font-normal text-foreground hover:bg-secondary hover:text-foreground';
export const dialogConfirm = 'h-11 rounded-lg px-4 text-base font-semibold';

/** Rótulo + campo, em coluna. */
export function AccountField({ label, htmlFor, aside, hint, error, children, className }: {
  label: string;
  htmlFor: string;
  /** Algo à direita do rótulo (ex.: "Esqueceu sua senha?"). */
  aside?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-base">{label}</label>
        {aside}
      </div>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
    </div>
  );
}

/** Campo de senha com o botão de mostrar/ocultar dentro dele. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<ComponentProps<'input'>, 'type'> & { reveal?: boolean }>(
  ({ className, reveal = true, ...props }, ref) => {
    const [shown, setShown] = useState(false);
    if (!reveal) return <Input ref={ref} type="password" className={cn(accountInput, className)} {...props} />;
    return (
      <div className="relative">
        <Input ref={ref} type={shown ? 'text' : 'password'} className={cn(accountInput, 'pr-12', className)} {...props} />
        <button
          type="button"
          onClick={() => setShown(v => !v)}
          aria-label={shown ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={shown}
          className="absolute right-0.5 top-0.5 flex h-[42px] w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {shown ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

/** Divisor "ou" entre o login por email e o do Google. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground" role="separator" aria-label="ou">
      <span className="h-px flex-1 bg-hairline" />
      ou
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}

/** Link dourado sublinhado (Criar conta, Voltar para Login…). */
export const accountLink =
  'rounded-sm py-1.5 text-primary-text underline underline-offset-[3px] hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Ícone grande dos estados de resultado (email enviado, confirmado, erro). */
export function ResultIcon({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'success' | 'danger' }) {
  return (
    <span className={cn('[&_svg]:h-12 [&_svg]:w-12 [&_svg]:stroke-[1.5]', {
      gold: 'text-primary-text', success: 'text-success', danger: 'text-danger-text',
    }[tone])} aria-hidden="true">
      {children}
    </span>
  );
}

/** Título de seção dos cartões do Perfil. */
export const sectionTitle = 'font-heading text-[15px] font-bold uppercase tracking-[0.1em] text-primary-text';
