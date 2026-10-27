import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { SheetSection } from './SheetSection';
import type { SheetEntry } from './types';

interface Props {
  title: string;
  emptyText: string;
  /** Rótulo de um item ainda sem nome. Ex: "Novo poder". */
  newItemLabel: string;
  items: SheetEntry[];
  onChange: (items: SheetEntry[]) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  descriptionPlaceholder?: string;
}

/**
 * Lista de entradas nome + descrição (habilidades, poderes, talentos, traços),
 * no padrão de "Características e Traços" do 5.5e: seção recolhida por padrão,
 * cada item mostra só o nome até ser aberto, item novo já abre com o foco no
 * nome, e excluir fica dentro do item aberto.
 *
 * Por ser uma lista que cresce, use em largura total, abaixo do grid de
 * colunas — nunca dentro de uma coluna (o outro lado ficaria com espaço vazio).
 */
export function EntryListSection({
  title, emptyText, newItemLabel, items, onChange, onBlur, readOnly,
  descriptionPlaceholder = 'Descrição…',
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [focusId, setFocusId] = useState<string | null>(null);
  const list = items ?? [];

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const add = () => {
    const item = { id: crypto.randomUUID(), name: '', description: '' };
    onChange([...list, item]);
    setExpanded(prev => new Set(prev).add(item.id));
    setFocusId(item.id);
  };
  const update = (idx: number, patch: Partial<SheetEntry>) =>
    onChange(list.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  const remove = (idx: number) => onChange(list.filter((_, i) => i !== idx));

  return (
    <SheetSection
      title={`${title}${list.length ? ` (${list.length})` : ''}`}
      collapse="always"
      onBlur={onBlur}
      aside={!readOnly && (
        <Button variant="ghost" size="sm" onClick={add} className="h-8 gap-1 text-sm">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      )}
    >
      {list.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {list.map((item, idx) => {
            const isOpen = expanded.has(item.id);
            return (
              <div key={item.id} className="rounded-md border border-border/40 p-1 md:p-3">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm transition-colors hover:bg-primary/5"
                >
                  <span className={item.name ? 'truncate font-medium text-foreground' : 'truncate text-muted-foreground'}>
                    {item.name || newItemLabel}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="mt-2 space-y-2">
                    <Input
                      aria-label="Nome"
                      maxLength={120}
                      placeholder="Nome"
                      autoFocus={focusId === item.id}
                      value={item.name}
                      onChange={e => update(idx, { name: e.target.value })}
                      className="h-9 text-sm"
                    />
                    <div className="flex gap-2">
                      <Textarea
                        aria-label="Descrição"
                        maxLength={5_000}
                        placeholder={descriptionPlaceholder}
                        value={item.description}
                        onChange={e => update(idx, { description: e.target.value })}
                        className="min-h-[72px] flex-1 resize-y text-sm"
                      />
                      {!readOnly && (
                        <ConfirmDeleteButton
                          iconOnly
                          className="h-9 w-9 shrink-0 self-start"
                          onConfirm={() => remove(idx)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SheetSection>
  );
}
