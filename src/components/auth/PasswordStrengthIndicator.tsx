import { Check, X } from 'lucide-react';

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

export function getPasswordStrength(password: string): number {
  return rules.filter(r => r.test(password)).length;
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordStrength(password) === rules.length;
}

const strengthConfig = [
  { label: 'Muito fraca', color: 'bg-destructive' },
  { label: 'Fraca',       color: 'bg-orange-500' },
  { label: 'Média',       color: 'bg-yellow-500' },
  { label: 'Forte',       color: 'bg-green-500' },
  { label: 'Forte',       color: 'bg-green-500' },
];

interface Props {
  password: string;
}

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const { label, color } = strengthConfig[strength];

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? color : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Força: <span className="font-medium text-foreground">{label}</span>
      </p>

      {/* Checklist */}
      <ul className="space-y-1">
        {rules.map(rule => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-xs">
              {ok ? (
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
