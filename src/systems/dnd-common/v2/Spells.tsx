import { useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import type { Spell } from '@/types/character';
import { cn } from '@/lib/utils';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { ChipFilter } from '@/systems/shared/ui/ChipFilter';
import { AddButton, DeleteAction, ExpandableItem, useListEditing } from '@/systems/shared/ui/ExpandableList';
import { CheckField, SelectField, TextAreaField, TextField } from '@/systems/shared/ui/fields';
import { ABILITY_ABBR, ABILITY_LABELS, fmt, useDndSheet } from './context';

const LEVEL_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => ({ value: l, label: l === 0 ? 'Truque' : `${l}º` }));

const newSpell = (): Spell => ({
  id: crypto.randomUUID(), level: 0, name: '', castingTime: '', range: '',
  concentration: false, ritual: false, notes: '', materialRequired: '',
});

function Box({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-h-[64px] flex-col justify-center rounded-lg border border-hairline bg-background/40 px-3 py-1.5', className)}>
      <span className="text-sm italic text-muted-foreground">{label}</span>
      <span className="font-heading text-[20px] font-bold leading-tight">{children}</span>
    </div>
  );
}

/** Atributo de conjuração (abre o painel), CD e ataque. `withModifier`: caixa extra (computador). */
export function SpellcastingHeader({ withModifier, className }: { withModifier?: boolean; className?: string }) {
  const { sheet, d, openPanel, readOnly } = useDndSheet();
  const cast = sheet.spellcastingAbility || '';
  return (
    <div className={cn('grid gap-2', withModifier ? 'grid-cols-4' : 'grid-cols-3', className)}>
      <button
        type="button"
        onClick={() => openPanel({ kind: 'cast' })}
        disabled={readOnly}
        aria-label="Alterar atributo de conjuração"
        className="flex min-h-[64px] flex-col justify-center rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-left transition-colors hover:bg-primary/10 disabled:cursor-default"
      >
        <span className="text-sm italic text-muted-foreground">Atributo</span>
        <span className="flex items-center gap-1 font-heading text-[20px] font-bold leading-tight text-primary-text">
          {cast ? ABILITY_ABBR[cast] : '—'}
          {!readOnly && <ChevronDown className="h-4 w-4" />}
        </span>
        {cast && <span className="sr-only">{ABILITY_LABELS[cast]}</span>}
      </button>
      {withModifier && <Box label="Modificador">{fmt(d.castMod)}</Box>}
      <Box label="CD de magia">{d.spellDC ?? '—'}</Box>
      <Box label="Ataque">{fmt(d.spellAttack)}</Box>
    </div>
  );
}

function Pip({ filled, onClick, disabled, label }: { filled: boolean; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label}
      className="flex h-9 w-8 items-center justify-center disabled:cursor-default">
      <span className={cn('h-[18px] w-[18px] rotate-45', filled ? 'bg-primary' : 'border-[1.5px] border-muted-foreground/60')} />
    </button>
  );
}

function useSlots() {
  const { sheet, update, readOnly } = useDndSheet();
  const slot = (lv: number) => sheet.spellSlots?.[lv] ?? { total: 0, used: 0 };
  const tap = (lv: number, i: number) => {
    const { total, used } = slot(lv);
    const available = total - used;
    const nextAvailable = i < available ? i : i + 1; // cheio: gasta até ele; vazio: recupera até ele
    update({ spellSlots: { ...sheet.spellSlots, [lv]: { total, used: total - nextAvailable } } });
  };
  return { slot, tap, readOnly };
}

/** Espaços por círculo em linhas (celular e tablet). Só círculos com total > 0. */
export function SpellSlotsRows({ className }: { className?: string }) {
  const { openPanel } = useDndSheet();
  const { slot, tap, readOnly } = useSlots();
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(lv => slot(lv).total > 0);
  return (
    <SheetCard
      title="Espaços de magia"
      className={className}
      action={!readOnly && (
        <button type="button" onClick={() => openPanel({ kind: 'slots' })} aria-label="Editar espaços de magia"
          className="flex h-9 items-center gap-1.5 rounded-md px-2 text-[15px] text-muted-foreground hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />Editar
        </button>
      )}
    >
      {levels.length === 0 && <p className="text-[15px] italic text-muted-foreground">Nenhum espaço definido.</p>}
      {levels.map(lv => {
        const { total, used } = slot(lv);
        const available = total - used;
        return (
          <div key={lv} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[15px]">{lv}º círculo</span>
            <div className="flex flex-wrap">
              {Array.from({ length: total }, (_, i) => (
                <Pip key={i} filled={i < available} disabled={readOnly} onClick={() => tap(lv, i)}
                  label={i < available ? `Gastar espaço do ${lv}º círculo` : `Recuperar espaço do ${lv}º círculo`} />
              ))}
            </div>
            <span className="ml-auto shrink-0 font-heading font-bold">{available} / {total}</span>
          </div>
        );
      })}
    </SheetCard>
  );
}

/** Espaços em 9 colunas (computador); "—" quando o total é 0. */
export function SpellSlotsColumns() {
  const { slot, tap, readOnly } = useSlots();
  return (
    <div className="grid grid-cols-9 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lv => {
        const { total, used } = slot(lv);
        const available = total - used;
        return (
          <div key={lv} className="flex min-h-[96px] flex-col items-center gap-1 rounded-lg border border-hairline bg-background/40 p-1.5">
            <span className="font-heading text-sm font-bold">{lv}º</span>
            {total === 0 ? <span className="text-muted-foreground">—</span> : (
              <>
                <div className="flex flex-wrap justify-center">
                  {Array.from({ length: total }, (_, i) => (
                    <Pip key={i} filled={i < available} disabled={readOnly} onClick={() => tap(lv, i)}
                      label={i < available ? `Gastar espaço do ${lv}º círculo` : `Recuperar espaço do ${lv}º círculo`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{available} / {total}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SpellForm({ s, set }: { s: Spell; set: (p: Partial<Spell>) => void }) {
  return (
    <>
      <div className="grid grid-cols-[120px_1fr] gap-3">
        <SelectField label="Círculo" value={Number(s.level) || 0} options={LEVEL_OPTIONS} onChange={v => set({ level: v })} />
        <TextField label="Nome" value={s.name} onChange={v => set({ name: v })} placeholder="Nome" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Tempo" value={s.castingTime} onChange={v => set({ castingTime: v })} placeholder="1 ação" />
        <TextField label="Alcance" value={s.range} onChange={v => set({ range: v })} placeholder="30 pés" />
      </div>
      <TextAreaField label="Notas / Material" value={s.notes} onChange={v => set({ notes: v })} placeholder="Componentes, observações…" />
      <div className="flex gap-6">
        <CheckField label="Concentração" checked={s.concentration} onChange={v => set({ concentration: v })} />
        <CheckField label="Ritual" checked={s.ritual} onChange={v => set({ ritual: v })} />
      </div>
    </>
  );
}

function Tag({ children, title }: { children: string; title: string }) {
  return (
    <span title={title} aria-label={title}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-hairline font-heading text-xs font-bold text-muted-foreground">
      {children}
    </span>
  );
}

/** Magias: "+ Nova magia", pílulas por círculo e grupos. `table`: colunas Nome | Tempo | Alcance (computador). */
export function SpellsList({ table, bare, className }: { table?: boolean; bare?: boolean; className?: string }) {
  const { sheet, update, readOnly } = useDndSheet();
  const ed = useListEditing<Spell>(sheet.spells, list => update({ spells: list }), newSpell);
  const [filter, setFilter] = useState('all');

  const present = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(l => ed.list.some(s => (Number(s.level) || 0) === l));
  const chips = [{ value: 'all', label: 'Todas' }, ...present.map(l => ({ value: String(l), label: l === 0 ? 'Truques' : `${l}º` }))];
  const active = chips.some(c => c.value === filter) ? filter : 'all';
  const groups = present.filter(l => active === 'all' || String(l) === active);
  const cols = 'grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_56px] gap-3';

  return (
    <SheetCard title="Magias" meta={`${ed.list.length} ${ed.list.length === 1 ? 'magia' : 'magias'}`} className={className} bare={bare}>
      {!readOnly && <AddButton label="Nova magia" onClick={() => { setFilter('all'); ed.add(); }} />}
      {present.length > 0 && <ChipFilter ariaLabel="Filtrar por círculo" options={chips} value={active} onChange={setFilter} />}
      {ed.list.length === 0 && <p className="py-2 text-center text-[15px] italic text-muted-foreground">Nenhuma magia anotada.</p>}
      {groups.map(lv => (
        <div key={lv} className="flex flex-col gap-2">
          <h3 className="pt-1 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {lv === 0 ? 'Truques' : `${lv}º círculo`}
          </h3>
          {table && (
            <div className={cn(cols, 'px-3 pr-10 text-sm italic text-muted-foreground')}>
              <span>Nome</span><span>Tempo</span><span>Alcance</span><span />
            </div>
          )}
          {ed.list.filter(s => (Number(s.level) || 0) === lv).map(s => {
            const open = ed.openId === s.id;
            const tags = (
              <span className="flex gap-1">
                {s.concentration && <Tag title="Concentração">C</Tag>}
                {s.ritual && <Tag title="Ritual">R</Tag>}
              </span>
            );
            return (
              <ExpandableItem
                key={s.id}
                open={open}
                onToggle={() => ed.toggle(s.id)}
                autoFocus={ed.focusId === s.id}
                summary={table ? (
                  <div className={cn(cols, 'items-center text-base')}>
                    <span className={cn('truncate font-semibold', !s.name && 'font-normal italic text-muted-foreground')}>{s.name || 'Nova magia'}</span>
                    <span className="truncate text-muted-foreground">{s.castingTime || '—'}</span>
                    <span className="truncate text-muted-foreground">{s.range || '—'}</span>
                    {tags}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className={cn('truncate text-base font-semibold', !s.name && 'font-normal italic text-muted-foreground')}>{s.name || 'Nova magia'}</span>
                      <span className="truncate text-sm text-muted-foreground">
                        {[s.castingTime, s.range].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </span>
                    {tags}
                  </div>
                )}
              >
                <fieldset disabled={readOnly} className="contents">
                  <SpellForm s={s} set={p => ed.update(s.id, p)} />
                </fieldset>
                {!readOnly && <DeleteAction onConfirm={() => ed.remove(s.id)} />}
              </ExpandableItem>
            );
          })}
        </div>
      ))}
    </SheetCard>
  );
}

/** Conjuração do computador: atributo/modificador/CD/ataque, espaços em 9 colunas e magias em tabela. */
export function DndDesktopSpellcasting() {
  const { readOnly, openPanel } = useDndSheet();
  return (
    <SheetCard
      id="magias"
      title="Conjuração"
      action={!readOnly && (
        <button type="button" onClick={() => openPanel({ kind: 'slots' })}
          className="flex h-9 items-center gap-1.5 rounded-md px-2 text-[15px] text-muted-foreground hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />Editar espaços
        </button>
      )}
    >
      <SpellcastingHeader withModifier />
      <SpellSlotsColumns />
      <SpellsList table bare />
    </SheetCard>
  );
}
