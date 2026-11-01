import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CampaignNote, CustomField } from '@/systems/shared/types';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { ChipFilter } from '@/systems/shared/ui/ChipFilter';
import { AddButton, DeleteAction, ExpandableItem, ExpandableList, useListEditing } from '@/systems/shared/ui/ExpandableList';
import { SelectField, TextAreaField, TextField } from '@/systems/shared/ui/fields';

/*
 * Notas da campanha e campos personalizáveis no visual do redesign.
 * Recursos do Grimório, comuns a qualquer sistema (dependem só de shared/types).
 */

type Category = CampaignNote['category'];
const CATEGORY_LABEL: Record<Category, string> = { npcs: 'NPC', locations: 'Local', events: 'Evento', general: 'Geral' };
const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'npcs', label: 'NPCs' }, { value: 'locations', label: 'Locais' },
  { value: 'events', label: 'Eventos' }, { value: 'general', label: 'Geral' },
];

interface NotesProps {
  notes: CampaignNote[] | null | undefined;
  onChange: (notes: CampaignNote[]) => void;
  readOnly?: boolean;
  /** Cartões em grade (computador); a nota aberta ocupa a linha inteira. */
  grid?: boolean;
  className?: string;
  bare?: boolean;
}

export function NotesList({ notes, onChange, readOnly, grid, className, bare }: NotesProps) {
  const [filter, setFilter] = useState<'all' | Category>('all');
  const ed = useListEditing<CampaignNote>(notes, onChange, () => ({
    id: crypto.randomUUID(),
    category: filter === 'all' ? 'general' : filter,
    title: '',
    content: '',
  }));
  const shown = ed.list.filter(n => filter === 'all' || n.category === filter);

  return (
    <SheetCard title="Notas da campanha" id="notas" className={className} bare={bare}>
      {!readOnly && <AddButton label="Nova nota" onClick={ed.add} />}
      <ChipFilter<'all' | Category>
        ariaLabel="Filtrar notas"
        value={filter}
        onChange={setFilter}
        options={[{ value: 'all', label: 'Todas' }, ...CATEGORY_OPTIONS]}
      />
      {shown.length === 0 && <p className="py-2 text-center text-[15px] italic text-muted-foreground">Nenhuma nota nesta categoria.</p>}
      <div className={cn(grid ? 'grid grid-cols-2 gap-2 xl:grid-cols-3' : 'flex flex-col gap-2')}>
        {shown.map(n => {
          const open = ed.openId === n.id;
          return (
            <ExpandableItem
              key={n.id}
              open={open}
              onToggle={() => ed.toggle(n.id)}
              autoFocus={ed.focusId === n.id}
              className={cn(grid && open && 'col-span-full')}
              summary={
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-primary-text">
                    {CATEGORY_LABEL[n.category] ?? 'Geral'}
                  </span>
                  <span className={cn('truncate text-base font-semibold', !n.title && 'font-normal italic text-muted-foreground')}>
                    {n.title || 'Nova nota'}
                  </span>
                  {!open && n.content && <span className="line-clamp-2 text-sm text-muted-foreground">{n.content}</span>}
                </div>
              }
            >
              <fieldset disabled={readOnly} className="contents">
                <SelectField<Category> label="Categoria" value={n.category} options={CATEGORY_OPTIONS}
                  onChange={v => ed.update(n.id, { category: v })} />
                <TextField label="Título" value={n.title} placeholder="Título" onChange={v => ed.update(n.id, { title: v })} />
                <TextAreaField label="Conteúdo" value={n.content} placeholder="Conteúdo…" maxLength={5000} minRows={6}
                  onChange={v => ed.update(n.id, { content: v })} />
              </fieldset>
              {!readOnly && <DeleteAction onConfirm={() => ed.remove(n.id)} />}
            </ExpandableItem>
          );
        })}
      </div>
    </SheetCard>
  );
}

interface FieldsProps {
  fields: CustomField[] | null | undefined;
  onChange: (fields: CustomField[]) => void;
  readOnly?: boolean;
  className?: string;
  bare?: boolean;
}

export function CustomFieldsList({ fields, onChange, readOnly, className, bare }: FieldsProps) {
  return (
    <SheetCard title="Campos personalizáveis" id="campos" className={className} bare={bare}>
      <ExpandableList<CustomField>
        items={fields}
        onChange={onChange}
        createItem={() => ({ id: crypto.randomUUID(), section: 'geral', label: '', value: '' })}
        addLabel="Novo campo"
        emptyText="Nenhum campo personalizado."
        readOnly={readOnly}
        renderSummary={f => (
          <div className="flex flex-col">
            <span className={cn('truncate text-base font-semibold', !f.label && 'font-normal italic text-muted-foreground')}>
              {f.label || 'Novo campo'}
            </span>
            {f.value && <span className="line-clamp-1 text-sm text-muted-foreground">{f.value}</span>}
          </div>
        )}
        renderForm={(f, set) => (
          <>
            <TextField label="Nome do campo" value={f.label} placeholder="Nome do campo" onChange={v => set({ label: v })} />
            <TextAreaField label="Valor" value={f.value} placeholder="Valor" minRows={5} onChange={v => set({ value: v })} />
          </>
        )}
      />
    </SheetCard>
  );
}
