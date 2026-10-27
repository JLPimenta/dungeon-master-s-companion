import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { SheetSection } from '@/systems/shared/SheetSection';
import { newId, type T20SectionProps } from './common';
import type { T20Attack } from '../types';

type Field = keyof Omit<T20Attack, 'id' | 'notes'>;

const COLUMNS: { key: Field; label: string; placeholder: string; max: number }[] = [
  { key: 'name', label: 'Ataque', placeholder: 'Espada longa', max: 100 },
  { key: 'attackBonus', label: 'Teste', placeholder: '+5', max: 30 },
  { key: 'damage', label: 'Dano', placeholder: '1d8+3', max: 50 },
  { key: 'critical', label: 'Crítico', placeholder: '19/x2', max: 30 },
  { key: 'damageType', label: 'Tipo', placeholder: 'Corte', max: 50 },
  { key: 'range', label: 'Alcance', placeholder: 'Corpo a corpo', max: 50 },
];

/** Mesma lógica de grade do WeaponsTable do 5.5e: nome flexível, campos curtos fixos. */
const DESKTOP_GRID = 'md:grid-cols-[1fr_64px_84px_68px_84px_112px_36px]';

/**
 * Ataques, no padrão do WeaponsTable do 5.5e: no desktop uma linha por ataque,
 * com cabeçalho de colunas e altura máxima com rolagem (a coluna da direita
 * não cresce sem limite); no celular, cards recolhíveis com rótulos.
 */
export function T20Attacks({ sheet, onChange, onBlur, readOnly }: T20SectionProps) {
  const attacks = sheet.attacks ?? [];
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const add = () => {
    const id = newId();
    onChange({
      attacks: [...attacks, { id, name: '', attackBonus: '', damage: '', critical: '', damageType: '', range: '', notes: '' }],
    });
    setExpanded(prev => new Set(prev).add(id));
  };
  const update = (idx: number, patch: Partial<T20Attack>) =>
    onChange({ attacks: attacks.map((a, i) => (i === idx ? { ...a, ...patch } : a)) });
  const remove = (idx: number) => onChange({ attacks: attacks.filter((_, i) => i !== idx) });

  return (
    <SheetSection
      title="Ataques"
      onBlur={onBlur}
      aside={!readOnly && (
        <Button variant="ghost" size="sm" onClick={add} className="h-8 shrink-0 gap-1 text-sm">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      )}
    >
      {attacks.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Nenhum ataque adicionado.</p>
      ) : (
        <div className="space-y-3">
          <div className={`hidden gap-2 px-1 md:grid ${DESKTOP_GRID}`}>
            {COLUMNS.map(c => <Label key={c.key} className="text-sm text-muted-foreground">{c.label}</Label>)}
            <span />
          </div>

          <div className="space-y-3 pb-1 lg:max-h-[260px] lg:overflow-y-auto lg:pr-1">
            {attacks.map((attack, idx) => {
              const isOpen = expanded.has(attack.id);
              return (
                <div key={attack.id} className="relative rounded-md border border-border/40 p-3 md:border-0 md:p-0">
                  {/* Celular: card recolhível */}
                  <div className="md:hidden">
                    <button
                      type="button"
                      onClick={() => toggle(attack.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm transition-colors hover:bg-primary/5"
                    >
                      <span className="truncate font-medium text-foreground">
                        {attack.name || 'Novo ataque'}
                        {attack.damage && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {[attack.attackBonus, attack.damage].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {COLUMNS.map(c => (
                          <div key={c.key} className={c.key === 'name' ? 'col-span-2' : undefined}>
                            <Label className="text-sm text-muted-foreground">{c.label}</Label>
                            <Input
                              maxLength={c.max}
                              placeholder={c.placeholder}
                              value={attack[c.key] ?? ''}
                              onChange={e => update(idx, { [c.key]: e.target.value })}
                              className="mt-1 h-10 text-sm"
                            />
                          </div>
                        ))}
                        {!readOnly && (
                          <ConfirmDeleteButton
                            iconOnly={false}
                            className="col-span-2 h-8 w-full justify-start gap-1 text-sm text-muted-foreground hover:text-destructive"
                            onConfirm={() => remove(idx)}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Desktop: uma linha */}
                  <div className={`hidden items-center gap-2 md:grid ${DESKTOP_GRID}`}>
                    {COLUMNS.map(c => (
                      <Input
                        key={c.key}
                        aria-label={c.label}
                        title={attack[c.key] || c.label}
                        maxLength={c.max}
                        placeholder={c.placeholder}
                        value={attack[c.key] ?? ''}
                        onChange={e => update(idx, { [c.key]: e.target.value })}
                        className="h-10 text-sm"
                      />
                    ))}
                    {readOnly ? <span /> : (
                      <ConfirmDeleteButton iconOnly className="h-10 w-9" onConfirm={() => remove(idx)} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SheetSection>
  );
}
