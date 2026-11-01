import { cn } from '@/lib/utils';

interface Rule {
  label: string;
  test: (p: string) => boolean;
}

const rules: Rule[] = [
  { label: 'Mínimo 8 caracteres',  test: p => p.length >= 8 },
  { label: 'Letra maiúscula',       test: p => /[A-Z]/.test(p) },
  { label: 'Letra minúscula',       test: p => /[a-z]/.test(p) },
  { label: 'Número',                test: p => /[0-9]/.test(p) },
];

// eslint-disable-next-line react-refresh/only-export-components
export function getPasswordStrength(password: string): number {
  return rules.filter(r => r.test(password)).length;
}

// eslint-disable-next-line react-refresh/only-export-components
export function isPasswordStrong(password: string): boolean {
  return getPasswordStrength(password) === rules.length;
}

const strengthConfig = [
  { label: 'Muito fraca', color: 'bg-danger-text' },
  { label: 'Fraca',       color: 'bg-orange-500' },
  { label: 'Média',       color: 'bg-yellow-500' },
  { label: 'Forte',       color: 'bg-success' },
  { label: 'Forte',       color: 'bg-success' },
];

interface Props {
  password: string;
}

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const { label, color } = strengthConfig[strength];

  return (
    <div className="mt-1.5 flex flex-col gap-1.5">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={cn('h-[5px] flex-1 rounded-full transition-colors duration-300', i < strength ? color : 'bg-border')}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Força: <strong className="font-semibold text-foreground">{label}</strong>
      </p>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {rules.map(rule => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={cn('text-sm', ok ? 'text-foreground' : 'text-muted-foreground')}>
              <span aria-hidden="true" className={ok ? 'text-success' : undefined}>{ok ? '✓ ' : '× '}</span>
              <span className="sr-only">{ok ? 'Atendido: ' : 'Pendente: '}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
