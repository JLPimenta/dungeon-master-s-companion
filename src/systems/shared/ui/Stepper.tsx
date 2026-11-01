import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberField } from './NumberField';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  /** Mostra "+" em valores positivos (bônus). */
  showPlus?: boolean;
  /** Nome do valor, usado nos rótulos acessíveis ("Diminuir bônus adicional"). */
  label: string;
  /** false: mostra o número sem campo de digitação. */
  editable?: boolean;
  disabled?: boolean;
  className?: string;
}

const stepBtn =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 text-foreground ' +
  'transition-colors hover:bg-primary/10 active:scale-95 disabled:pointer-events-none disabled:opacity-40';

/**
 * − valor +. Os botões são atalho: o valor continua digitável
 * (regra 5 de docs/redesign-v2/01-regras.md).
 */
export function Stepper({
  value, onChange, min, max, allowNegative, showPlus, label, editable = true, disabled, className,
}: StepperProps) {
  const dec = () => onChange(min !== undefined ? Math.max(min, value - 1) : value - 1);
  const inc = () => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1);
  const shown = showPlus && value > 0 ? `+${value}` : String(value);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button type="button" className={stepBtn} onClick={dec} disabled={disabled || (min !== undefined && value <= min)}
        aria-label={`Diminuir ${label}`}>
        <Minus className="h-4 w-4" />
      </button>
      {editable && !disabled ? (
        <NumberField
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          allowNegative={allowNegative}
          showPlus={showPlus}
          aria-label={label}
          className="h-10 w-14 rounded-md border border-border/60 font-heading text-lg font-bold focus:border-primary"
        />
      ) : (
        <span className="w-14 text-center font-heading text-lg font-bold" aria-label={label}>{shown}</span>
      )}
      <button type="button" className={stepBtn} onClick={inc} disabled={disabled || (max !== undefined && value >= max)}
        aria-label={`Aumentar ${label}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
