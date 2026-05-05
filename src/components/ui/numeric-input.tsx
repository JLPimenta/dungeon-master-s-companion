import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  value: number;
  onChange: (v: number) => void;
  /** Minimum allowed value. Applied on blur. */
  min?: number;
  /** Maximum allowed value. Applied on blur. */
  max?: number;
  /** Fallback when the field is empty or NaN. Default: `min ?? 0`. */
  fallback?: number;
  className?: string;
  /** Extra onBlur handler (called after internal value normalization). */
  onBlur?: () => void;
  title?: string;
  disabled?: boolean;
}

/**
 * Numeric input that keeps a local string state while editing.
 *
 * Solves the "forced zero" problem: standard `<input type="number" value={0}>`
 * shows "0" even while the user is clearing the field to type a new number.
 *
 * This component lets the user freely edit the raw text and only parses +
 * clamps the value on blur/enter.
 */
export function NumericInput({
  value,
  onChange,
  min,
  max,
  fallback,
  className,
  onBlur,
  title,
  disabled,
}: NumericInputProps) {
  const effectiveFallback = fallback ?? min ?? 0;
  const [raw, setRaw] = useState(String(value));

  // Sync when external value changes (load, reset, discard, etc.)
  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    // Allow empty string and lone minus while typing
    if (v === '' || v === '-') {
      setRaw(v);
      return;
    }

    // Accept integers (possibly negative)
    if (/^-?\d+$/.test(v)) {
      setRaw(v);
    }
  };

  const commit = () => {
    let n = parseInt(raw, 10);
    if (isNaN(n)) n = effectiveFallback;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    setRaw(String(n));
    onChange(n);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={raw}
      onChange={handleChange}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      onFocus={e => e.target.select()}
      title={title}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'md:text-sm',
        className,
      )}
    />
  );
}
