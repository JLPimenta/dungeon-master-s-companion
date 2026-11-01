import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface NavItem<Id extends string> {
  id: Id;
  label: string;
  icon: LucideIcon;
}

interface NavProps<Id extends string> {
  items: NavItem<Id>[];
  active: Id;
  onSelect: (id: Id) => void;
}

/** Navegação inferior do celular: 5 botões com ícone e rótulo; ativo em dourado com traço no topo. */
export function BottomNav<Id extends string>({ items, active, onSelect }: NavProps<Id>) {
  return (
    <nav
      aria-label="Seções da ficha"
      className="grid shrink-0 border-t border-border/50 bg-surface pb-[env(safe-area-inset-bottom)]"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(({ id, label, icon: Icon }) => {
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex h-[72px] flex-col items-center justify-center gap-1 text-sm transition-colors',
              on ? 'text-primary-text shadow-[inset_0_2px_0_hsl(var(--primary))]' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

interface SideRailProps<Id extends string> extends NavProps<Id> {
  top?: ReactNode;
  bottom?: ReactNode;
}

/** Trilho lateral do tablet (88 px). */
export function SideRail<Id extends string>({ items, active, onSelect, top, bottom }: SideRailProps<Id>) {
  return (
    <nav
      aria-label="Seções da ficha"
      className="flex w-[88px] shrink-0 flex-col items-center gap-1 border-r border-border/50 bg-surface py-3"
    >
      {top && <div className="mb-3">{top}</div>}
      {items.map(({ id, label, icon: Icon }) => {
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex h-[68px] w-[76px] flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors',
              on ? 'bg-primary/15 text-primary-text' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
            {label}
          </button>
        );
      })}
      {bottom && <div className="mt-auto px-1 text-center">{bottom}</div>}
    </nav>
  );
}
