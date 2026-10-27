import { useMemo, useState } from 'react';
import { SheetSection } from '@/systems/shared/SheetSection';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { cn } from '@/lib/utils';
import { AttributeSelect, Computed, newId, type T20SectionProps } from './common';
import { formatBonus, SPELL_CIRCLE_COST, spellDC } from '../rules';
import type { T20Spell, T20SpellCircle } from '../types';

const CIRCLES: T20SpellCircle[] = [1, 2, 3, 4, 5];

const FIELDS: { key: 'school' | 'execution' | 'range' | 'target' | 'duration' | 'resistance'; label: string; placeholder: string }[] = [
  { key: 'school', label: 'Escola', placeholder: 'Evocação' },
  { key: 'execution', label: 'Execução', placeholder: 'Padrão' },
  { key: 'range', label: 'Alcance', placeholder: 'Curto' },
  { key: 'target', label: 'Alvo / Área', placeholder: '1 criatura' },
  { key: 'duration', label: 'Duração', placeholder: 'Instantânea' },
  { key: 'resistance', label: 'Resistência', placeholder: 'Vontade anula' },
];

/** Busca do filtro de magias ignora maiúsculas e acentos. */
const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function T20Spells({ sheet, onChange, onBlur, readOnly }: T20SectionProps) {
  const spells = useMemo(() => sheet.spells ?? [], [sheet.spells]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const attribute = sheet.spellcasting?.attribute ?? 'int';
  const mod = sheet.attributes?.[attribute] ?? 0;

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return spells;
    return spells.filter(s => normalize(`${s.name} ${s.school} ${s.description}`).includes(q));
  }, [spells, query]);

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const add = (circle: T20SpellCircle) => {
    const spell: T20Spell = {
      id: newId(), circle, name: '', school: '', execution: '', range: '', target: '', duration: '', resistance: '', description: '',
    };
    onChange({ spells: [...spells, spell] });
    setExpanded(prev => new Set(prev).add(spell.id));
    setQuery('');
  };
  const update = (id: string, patch: Partial<T20Spell>) =>
    onChange({ spells: spells.map(s => (s.id === id ? { ...s, ...patch } : s)) });
  const remove = (id: string) => onChange({ spells: spells.filter(s => s.id !== id) });

  return (
    <SheetSection title="Magias" collapse="mobile" onBlur={onBlur}>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label className="text-sm text-muted-foreground">Atributo-chave</Label>
          <AttributeSelect
            label="Atributo-chave das magias"
            value={attribute}
            onChange={a => onChange({ spellcasting: { ...sheet.spellcasting, attribute: a } })}
            className="mt-1 h-10 w-full"
            showChevron
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Modificador</Label>
          <Computed className="mt-1">{formatBonus(mod)}</Computed>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Teste de resistência</Label>
          <Computed className="mt-1" title="10 + ½ nível + atributo-chave">CD {spellDC(sheet)}</Computed>
        </div>
      </div>

      {spells.length > 6 && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Buscar magia"
            placeholder="Buscar por nome, escola ou efeito…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
      )}

      <div className="space-y-4">
        {CIRCLES.map(circle => {
          const inCircle = visible.filter(s => s.circle === circle);
          const total = spells.filter(s => s.circle === circle).length;
          if (readOnly && total === 0) return null;
          if (query && inCircle.length === 0) return null;

          return (
            <section key={circle} aria-label={`${circle}º círculo`}>
              <div className="mb-1.5 flex items-center justify-between border-b border-primary/20 pb-1">
                <h4 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  {circle}º Círculo
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {SPELL_CIRCLE_COST[circle]} PM · {total} {total === 1 ? 'magia' : 'magias'}
                  </span>
                </h4>
                {!readOnly && (
                  <Button variant="ghost" size="sm" onClick={() => add(circle)} className="h-7 gap-1 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Magia
                  </Button>
                )}
              </div>

              {inCircle.length === 0 ? (
                <p className="px-1 py-1 text-xs text-muted-foreground/70">Nenhuma magia deste círculo.</p>
              ) : (
                <ul className="space-y-1">
                  {inCircle.map(spell => {
                    const isOpen = expanded.has(spell.id);
                    const summary = [spell.school, spell.execution, spell.range, spell.duration].filter(Boolean).join(' · ');
                    return (
                      <li key={spell.id} className="rounded-md border border-border/50 p-1">
                        <button
                          type="button"
                          onClick={() => toggle(spell.id)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-primary/5"
                        >
                          <span className="flex min-w-0 items-center gap-3 pr-4 md:gap-6">
                            <span className={cn('truncate font-medium md:w-56', !spell.name && 'text-muted-foreground')}>
                              {spell.name || 'Nova magia'}
                            </span>
                            {summary && <span className="hidden truncate text-xs text-muted-foreground md:inline">{summary}</span>}
                          </span>
                          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
                        </button>

                        {isOpen && (
                          <div className="mt-1 space-y-2 border-t border-border/40 p-2">
                            <div className="grid grid-cols-[1fr_6.5rem] gap-2">
                              <Input
                                aria-label="Nome da magia"
                                maxLength={120}
                                placeholder="Nome"
                                value={spell.name}
                                onChange={e => update(spell.id, { name: e.target.value })}
                                className="h-9 text-sm"
                              />
                              <Select
                                value={String(spell.circle)}
                                onValueChange={v => update(spell.id, { circle: Number(v) as T20SpellCircle })}
                              >
                                <SelectTrigger aria-label="Círculo" className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {CIRCLES.map(c => <SelectItem key={c} value={String(c)}>{c}º círculo</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                              {FIELDS.map(f => (
                                <div key={f.key}>
                                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                                  <Input
                                    maxLength={100}
                                    placeholder={f.placeholder}
                                    value={spell[f.key] ?? ''}
                                    onChange={e => update(spell.id, { [f.key]: e.target.value })}
                                    className="mt-1 h-8 text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                            <Textarea
                              aria-label="Efeito"
                              maxLength={5_000}
                              placeholder="Efeito e aprimoramentos (+PM)…"
                              value={spell.description}
                              onChange={e => update(spell.id, { description: e.target.value })}
                              className="min-h-[72px] text-sm"
                            />
                            {!readOnly && (
                              <div className="flex justify-end">
                                <ConfirmDeleteButton
                                  iconOnly={false}
                                  className="h-8 gap-1 text-sm text-muted-foreground hover:text-destructive"
                                  onConfirm={() => remove(spell.id)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </SheetSection>
  );
}
