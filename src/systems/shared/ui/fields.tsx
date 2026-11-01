import { useId, type ReactNode } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/lib/utils';
import { NumberField, type NumberFieldProps } from './NumberField';

/*
 * Campos de formulário do redesign: rótulo de 14 px em itálico, campo de
 * 44 px com texto de 16 px (evita o zoom automático do iOS).
 */

export const inputClass =
  'h-11 w-full rounded-md border border-hairline bg-background px-3 text-base text-foreground ' +
  'placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary ' +
  'disabled:cursor-default disabled:opacity-80';

export const labelClass = 'text-sm italic text-muted-foreground';

interface FieldShellProps {
  label: string;
  children: (id: string) => ReactNode;
  className?: string;
}

/** Rótulo + campo, com `htmlFor` ligado. */
export function Field({ label, children, className }: FieldShellProps) {
  const id = useId();
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children(id)}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function TextField({ label, value, onChange, placeholder, maxLength, className }: TextFieldProps) {
  return (
    <Field label={label} className={className}>
      {id => (
        <input
          id={id}
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputClass}
        />
      )}
    </Field>
  );
}

interface TextAreaFieldProps extends TextFieldProps {
  minRows?: number;
}

export function TextAreaField({ label, value, onChange, placeholder, maxLength, minRows = 3, className }: TextAreaFieldProps) {
  return (
    <Field label={label} className={className}>
      {id => (
        <TextareaAutosize
          id={id}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          minRows={minRows}
          className={cn(inputClass, 'h-auto resize-none py-2 leading-snug')}
        />
      )}
    </Field>
  );
}

interface NumberInputFieldProps extends Omit<NumberFieldProps, 'aria-label' | 'id'> {
  label: string;
}

export function NumberInputField({ label, className, ...props }: NumberInputFieldProps) {
  return (
    <Field label={label} className={className}>
      {id => <NumberField id={id} {...props} className={cn(inputClass, 'text-left')} />}
    </Field>
  );
}

interface SelectFieldProps<V extends string | number> {
  label: string;
  value: V;
  onChange: (value: V) => void;
  options: { value: V; label: string }[];
  className?: string;
}

export function SelectField<V extends string | number>({ label, value, onChange, options, className }: SelectFieldProps<V>) {
  return (
    <Field label={label} className={className}>
      {id => (
        <select
          id={id}
          value={String(value)}
          onChange={e => {
            const found = options.find(o => String(o.value) === e.target.value);
            if (found) onChange(found.value);
          }}
          className={cn(inputClass, 'appearance-auto')}
        >
          {options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}

export function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex h-11 cursor-pointer items-center gap-2 text-base">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={e => onChange(e.target.checked)}
        className="h-5 w-5 accent-[hsl(var(--primary))]"
      />
      {label}
    </label>
  );
}
