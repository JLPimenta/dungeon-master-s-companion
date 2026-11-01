import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const sectionTitleClass =
  'font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-primary-text';

interface SheetCardProps {
  title?: ReactNode;
  /** Complemento do título em texto normal (ex.: "13 ataques"). */
  meta?: ReactNode;
  /** Ação à direita do título (ex.: "Editar"). */
  action?: ReactNode;
  /** Âncora (atalhos de seção no computador). */
  id?: string;
  /** Sem moldura de cartão (seções dentro de outro cartão). */
  bare?: boolean;
  onBlur?: () => void;
  className?: string;
  children: ReactNode;
}

/** Cartão de seção da ficha no visual do redesign. */
export function SheetCard({ title, meta, action, id, bare, onBlur, className, children }: SheetCardProps) {
  return (
    <section
      id={id}
      onBlur={onBlur}
      className={cn(
        'flex min-w-0 flex-col gap-3 scroll-mt-24',
        !bare && 'rounded-xl border border-hairline bg-card p-3.5',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex min-h-[28px] items-center gap-2">
          {title && (
            <h2 className={cn(sectionTitleClass, 'flex min-w-0 items-baseline gap-2')}>
              <span className="truncate">{title}</span>
              {meta && (
                <span className="shrink-0 font-body text-sm font-normal normal-case tracking-normal text-muted-foreground">
                  {meta}
                </span>
              )}
            </h2>
          )}
          {action && <div className="ml-auto flex shrink-0 items-center">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
