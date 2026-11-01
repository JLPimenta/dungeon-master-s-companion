import { cn } from '@/lib/utils';
import type { SheetEntry } from '@/systems/shared/types';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { ExpandableList } from '@/systems/shared/ui/ExpandableList';
import { TextAreaField, TextField } from '@/systems/shared/ui/fields';

/**
 * Lista de entradas nome + descrição (características, habilidades, poderes)
 * no visual do redesign. Substitui o EntryListSection da v1 nos layouts v2.
 */
export function EntryListCard({
  title, items, onChange, readOnly, addLabel, newItemLabel, emptyText, descriptionPlaceholder = 'Descrição…',
  id, className, bare,
}: {
  title: string;
  items: SheetEntry[] | null | undefined;
  onChange: (items: SheetEntry[]) => void;
  readOnly: boolean;
  addLabel: string;
  /** Rótulo de um item ainda sem nome. Ex: "Novo poder". */
  newItemLabel: string;
  emptyText: string;
  descriptionPlaceholder?: string;
  id?: string;
  className?: string;
  bare?: boolean;
}) {
  const list = items ?? [];
  return (
    <SheetCard title={title} meta={list.length ? String(list.length) : undefined} id={id} className={className} bare={bare}>
      <ExpandableList<SheetEntry>
        items={list}
        onChange={onChange}
        createItem={() => ({ id: crypto.randomUUID(), name: '', description: '' })}
        addLabel={addLabel}
        emptyText={emptyText}
        readOnly={readOnly}
        renderSummary={e => (
          <div className="flex flex-col">
            <span className={cn('truncate text-base font-semibold', !e.name && 'font-normal italic text-muted-foreground')}>
              {e.name || newItemLabel}
            </span>
            {e.description && <span className="line-clamp-1 text-sm text-muted-foreground">{e.description}</span>}
          </div>
        )}
        renderForm={(e, set) => (
          <>
            <TextField label="Nome" value={e.name} onChange={v => set({ name: v })} placeholder={newItemLabel} maxLength={120} />
            <TextAreaField label="Descrição" value={e.description} onChange={v => set({ description: v })}
              placeholder={descriptionPlaceholder} maxLength={5000} minRows={5} />
          </>
        )}
      />
    </SheetCard>
  );
}
