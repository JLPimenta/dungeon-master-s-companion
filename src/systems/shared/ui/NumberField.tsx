import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/*
 * Campo numérico do redesign (docs/redesign-v2/02-arquitetura.md, "Campos numéricos").
 *
 * - Ao focar, seleciona tudo (o teclado do celular substitui o valor).
 * - Enquanto digita, guarda um rascunho de texto; cada valor válido já vai
 *   para `onChange` (a barra de vida responde na hora).
 * - Campo vazio (ou só "-") não grava nada.
 * - Ao sair, o rascunho é descartado e o campo volta a mostrar o valor salvo.
 */

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'min' | 'max'>;

export interface NumberFieldProps extends NativeProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Aceita sinal negativo (bônus). */
  allowNegative?: boolean;
  /** Aceita casas decimais (peso). Vírgula vale como ponto. */
  decimal?: boolean;
  /** Máximo de dígitos inteiros. Padrão 3. */
  maxDigits?: number;
  /** Mostra "+" antes de valores positivos (bônus). */
  showPlus?: boolean;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { value, onChange, min, max, allowNegative = false, decimal = false, maxDigits = 3, showPlus = false,
    className, onFocus, onBlur, ...rest },
  ref,
) {
  const [draft, setDraft] = useState<string | null>(null);

  const pattern = new RegExp(
    `^${allowNegative ? '-?' : ''}\\d{0,${maxDigits}}${decimal ? '([.,]\\d{0,2})?' : ''}$`,
  );

  const clamp = (n: number) => {
    let v = n;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return v;
  };

  const display = draft ?? (showPlus && value > 0 ? `+${value}` : String(value ?? 0));

  return (
    <input
      ref={ref}
      type="text"
      inputMode={allowNegative ? 'text' : decimal ? 'decimal' : 'numeric'}
      autoComplete="off"
      value={display}
      onFocus={e => {
        const el = e.currentTarget;
        setDraft(String(value ?? 0));
        el.select();
        // O rascunho pode mudar o texto (ex.: "+2" → "2"); seleciona de novo depois do render.
        requestAnimationFrame(() => { if (document.activeElement === el) el.select(); });
        onFocus?.(e);
      }}
      onChange={e => {
        const text = e.target.value.replace(/^\+/, '');
        if (!pattern.test(text)) return;
        setDraft(text);
        if (text === '' || text === '-') return;
        const n = decimal ? parseFloat(text.replace(',', '.')) : parseInt(text, 10);
        if (!Number.isNaN(n)) onChange(clamp(n));
      }}
      onBlur={e => {
        setDraft(null);
        onBlur?.(e);
      }}
      className={cn('min-w-0 bg-transparent text-center outline-none', className)}
      {...rest}
    />
  );
});
