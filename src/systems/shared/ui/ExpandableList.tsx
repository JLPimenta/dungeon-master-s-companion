import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

/*
 * Listas da ficha no padrão do redesign (docs/redesign-v2/03-ficha.md, "Listas expansíveis"):
 * - botão "+ Novo…" no topo;
 * - item novo entra no INÍCIO, já aberto, com o foco no primeiro campo;
 * - um item aberto por vez;
 * - excluir em dois toques ("Remover" → "Confirmar exclusão"), tocar fora cancela.
 *
 * Peças soltas (useListEditing, AddButton, ExpandableItem, DeleteAction) para
 * listas agrupadas (magias por círculo) e `ExpandableList` para o caso comum.
 */

export interface Identified {
  id: string;
}

export function useListEditing<T extends Identified>(
  items: T[] | null | undefined,
  onChange: (items: T[]) => void,
  createItem: () => T,
) {
  const list = items ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const add = () => {
    const item = createItem();
    onChange([item, ...list]);
    setOpenId(item.id);
    setFocusId(item.id);
  };
  const update = (id: string, patch: Partial<T>) =>
    onChange(list.map(it => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id: string) => {
    onChange(list.filter(it => it.id !== id));
    if (openId === id) setOpenId(null);
  };
  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
    setFocusId(null);
  };

  return { list, openId, focusId, add, update, remove, toggle, setOpenId };
}

/** Botão "+ Nova arma" etc., largura total, borda tracejada. */
export function AddButton({ label, onClick, disabled, disabledLabel }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Texto quando desabilitado (ex.: "Limite de sintonização atingido"). */
  disabledLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed font-heading text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors',
        disabled
          ? 'cursor-not-allowed border-hairline text-muted-foreground'
          : 'border-primary/60 text-primary-text hover:bg-primary/10',
      )}
    >
      {!disabled && <Plus className="h-4 w-4" />}
      {disabled && disabledLabel ? disabledLabel : label}
    </button>
  );
}

/** Exclusão em dois toques, como o ConfirmDeleteButton da v1. */
export function DeleteAction({ onConfirm, className }: { onConfirm: () => void; className?: string }) {
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const cancel = useCallback(() => setConfirming(false), []);
  useOnClickOutside(ref, cancel);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => (confirming ? onConfirm() : setConfirming(true))}
      title={confirming ? 'Toque novamente para excluir' : 'Remover'}
      className={cn(
        'flex h-10 items-center gap-1.5 justify-self-start rounded-md px-3 text-[15px] transition-colors',
        confirming
          ? 'bg-hp font-semibold text-white'
          : 'text-muted-foreground hover:text-hp',
        className,
      )}
    >
      <Trash2 className="h-4 w-4" />
      {confirming ? 'Confirmar exclusão' : 'Remover'}
    </button>
  );
}

interface ExpandableItemProps {
  open: boolean;
  onToggle: () => void;
  /** Conteúdo da linha fechada (dentro do botão). */
  summary: ReactNode;
  /** Formulário mostrado com o item aberto. */
  children?: ReactNode;
  /** Foca o primeiro campo do formulário ao montar (item recém-criado). */
  autoFocus?: boolean;
  /** Mostra a seta à direita. */
  chevron?: boolean;
  className?: string;
  summaryClassName?: string;
}

export function ExpandableItem({
  open, onToggle, summary, children, autoFocus, chevron = true, className, summaryClassName,
}: ExpandableItemProps) {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !autoFocus) return;
    const first = formRef.current?.querySelector<HTMLElement>('input, textarea, select');
    first?.focus();
  }, [open, autoFocus]);

  return (
    <div className={cn('rounded-lg border bg-card transition-colors', open ? 'border-primary/40' : 'border-hairline', className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn('flex min-h-[48px] w-full items-center gap-3 px-3 py-2 text-left', summaryClassName)}
      >
        <div className="min-w-0 flex-1">{summary}</div>
        {chevron && (
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        )}
      </button>
      {open && children && (
        <div ref={formRef} className="grid gap-3 border-t border-hairline px-3 pb-3 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface ExpandableListProps<T extends Identified> {
  items: T[] | null | undefined;
  onChange: (items: T[]) => void;
  createItem: () => T;
  addLabel: string;
  emptyText?: string;
  readOnly?: boolean;
  addDisabled?: boolean;
  addDisabledLabel?: string;
  renderSummary: (item: T, open: boolean) => ReactNode;
  renderForm: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  /** Cabeçalho de colunas (tabela no computador). */
  header?: ReactNode;
  className?: string;
  itemClassName?: string;
  summaryClassName?: string;
}

/** Lista expansível completa: adicionar no topo, abrir um por vez, editar e excluir. */
export function ExpandableList<T extends Identified>({
  items, onChange, createItem, addLabel, emptyText, readOnly, addDisabled, addDisabledLabel,
  renderSummary, renderForm, header, className, itemClassName, summaryClassName,
}: ExpandableListProps<T>) {
  const ed = useListEditing(items, onChange, createItem);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {!readOnly && (
        <AddButton label={addLabel} onClick={ed.add} disabled={addDisabled} disabledLabel={addDisabledLabel} />
      )}
      {header}
      {ed.list.length === 0 && emptyText && (
        <p className="py-3 text-center text-[15px] italic text-muted-foreground">{emptyText}</p>
      )}
      {ed.list.map(item => {
        const open = ed.openId === item.id;
        return (
          <ExpandableItem
            key={item.id}
            open={open}
            onToggle={() => ed.toggle(item.id)}
            autoFocus={ed.focusId === item.id}
            summary={renderSummary(item, open)}
            className={itemClassName}
            summaryClassName={summaryClassName}
          >
            <fieldset disabled={readOnly} className="contents">
              {renderForm(item, patch => ed.update(item.id, patch))}
            </fieldset>
            {!readOnly && <DeleteAction onConfirm={() => ed.remove(item.id)} />}
          </ExpandableItem>
        );
      })}
    </div>
  );
}
