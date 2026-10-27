import type { ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { T20Attribute, T20Sheet } from '../types';
import { T20_ATTRIBUTES } from '../rules';

export interface T20SectionProps {
  sheet: T20Sheet;
  onChange: (patch: Partial<T20Sheet>) => void;
  onBlur?: () => void;
  readOnly?: boolean;
}

/**
 * Seletor compacto de atributo (FOR, DES...). Usa o Select do shadcn, como o
 * 5.5e: o <select> nativo abre a lista com as cores do sistema operacional e
 * fica ilegível no tema escuro.
 */
export function AttributeSelect({
  value, onChange, disabled, className, label, showChevron = false,
}: {
  value: T20Attribute;
  onChange: (v: T20Attribute) => void;
  disabled?: boolean;
  className?: string;
  label: string;
  /** Seta do Select. Desligada nas linhas de perícia, onde falta espaço. */
  showChevron?: boolean;
}) {
  return (
    <Select value={value} onValueChange={v => onChange(v as T20Attribute)} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          'h-8 px-1.5 text-xs uppercase text-muted-foreground',
          showChevron ? 'justify-between' : 'justify-center [&>svg]:hidden',
          className,
        )}
      >
        {/* Só a sigla no gatilho; o nome completo aparece na lista. */}
        <SelectValue>{T20_ATTRIBUTES.find(a => a.key === value)?.abbr}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {T20_ATTRIBUTES.map(a => (
          <SelectItem key={a.key} value={a.key} className="text-xs">
            {a.abbr} <span className="ml-1 text-muted-foreground">{a.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Valor calculado (somente leitura), no mesmo visual dos totais do 5.5e. */
export function Computed({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <div
      title={title}
      className={cn(
        'flex h-10 items-center justify-center rounded-md border border-input bg-input/30 text-sm font-bold text-primary',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const newId = () => crypto.randomUUID();
