import { cn } from '@/lib/utils';

export interface ChipOption<V extends string> {
  value: V;
  label: string;
}

interface ChipFilterProps<V extends string> {
  options: ChipOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Ex.: "Filtrar por círculo". */
  ariaLabel: string;
  className?: string;
}

/** Filtro em pílulas (círculos de magia, categorias de nota). Rola na horizontal se não couber. */
export function ChipFilter<V extends string>({ options, value, onChange, ariaLabel, className }: ChipFilterProps<V>) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn('scrollbar-none flex gap-2 overflow-x-auto', className)}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-9 shrink-0 rounded-full border px-4 text-[15px] transition-colors',
              on
                ? 'border-primary bg-primary/15 text-primary-text'
                : 'border-hairline bg-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
