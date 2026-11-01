import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, Search, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { NumberField } from '@/systems/shared/ui/NumberField';
import { ChipFilter } from '@/systems/shared/ui/ChipFilter';
import { AddButton, DeleteAction, ExpandableItem, ExpandableList, useListEditing } from '@/systems/shared/ui/ExpandableList';
import { CheckField, NumberInputField, SelectField, TextAreaField, TextField, inputClass } from '@/systems/shared/ui/fields';
import { TextBlockCard, type IdentityField } from '@/systems/shared/ui/IdentityGrid';
import { EntryListCard } from '@/systems/shared/sections/EntryList';
import { formatBonus, MAX_WORN_ITEMS, SPELL_CIRCLE_COST, T20_ATTRIBUTES } from '../rules';
import type { T20Attack, T20Item, T20Resource, T20Spell, T20SpellCircle } from '../types';
import { T20_SKILLS, useT20 } from './context';

/*
 * Seções da ficha Tormenta20 no redesign v2. Mesma linguagem visual das
 * fichas D&D; a mecânica é a do T20 (atributo = modificador, PV e PM,
 * Defesa calculada, perícias com ½ nível + treino, magias por círculo).
 */

export const fmt = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);
const abbr = (k: string) => T20_ATTRIBUTES.find(a => a.key === k)?.abbr ?? k.toUpperCase();

/* ── Identidade ─────────────────────────────────────────────── */

export const IDENTITY_T20: IdentityField[] = [
  { key: 'name', label: 'Nome', wide: true, maxLength: 255 },
  { key: 'class', label: 'Classe', placeholder: 'Ex: Clérigo' },
  { key: 'level', label: 'Nível', number: true, min: 1, max: 20 },
  { key: 'race', label: 'Raça', placeholder: 'Ex: Anão' },
  { key: 'origin', label: 'Origem', placeholder: 'Ex: Acólito' },
  { key: 'deity', label: 'Divindade', placeholder: 'Ex: Khalmyr' },
  { key: 'player', label: 'Jogador' },
  { key: 'xp', label: 'Experiência', number: true, min: 0, maxDigits: 7 },
  { key: 'downtimePoints', label: 'Pts. entre aventuras', number: true, min: 0, maxDigits: 4 },
];

export function useT20Identity() {
  const { sheet, update } = useT20();
  return {
    values: sheet as unknown as Record<string, unknown>,
    onChange: (key: string, value: string | number) => update({ [key]: value } as never),
  };
}

export function useT20Subtitle(): string {
  const { sheet } = useT20();
  const cls = [sheet.class?.trim(), sheet.level].filter(Boolean).join(' ');
  return [cls, sheet.race?.trim()].filter(Boolean).join(' · ');
}

/* ── PV e PM ───────────────────────────────────────────────── */

function Bar({ value, label, className, color, tempColor }: {
  value: T20Resource; label: string; className?: string; color: string; tempColor: string;
}) {
  const cur = Math.max(0, value?.current ?? 0);
  const temp = Math.max(0, value?.temp ?? 0);
  const total = Math.max(value?.max ?? 0, cur + temp) || 1;
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={cur}
      className={cn('flex h-2.5 w-full overflow-hidden rounded-full bg-foreground/10', className)}>
      <div className={cn('h-full transition-[width] duration-200', color)} style={{ width: `${(cur / total) * 100}%` }} />
      <div className={cn('h-full transition-[width] duration-200', tempColor)} style={{ width: `${(temp / total) * 100}%` }} />
    </div>
  );
}

const RESOURCES = {
  hp: { label: 'Pontos de vida', short: 'PV', color: 'bg-hp', temp: 'bg-hp-temp' },
  mp: { label: 'Pontos de mana', short: 'PM', color: 'bg-primary', temp: 'bg-primary/50' },
} as const;

/** PV ou PM: atual (grande), máximo, temporários e barra. */
export function ResourceBlock({ kind, size = 'lg' }: { kind: 'hp' | 'mp'; size?: 'lg' | 'md' }) {
  const { sheet, update, readOnly } = useT20();
  const meta = RESOURCES[kind];
  const value = sheet[kind] ?? { current: 0, max: 0, temp: 0 };
  const set = (patch: Partial<T20Resource>) => update({ [kind]: { ...value, ...patch } } as never);
  const field = 'rounded-md font-heading font-bold leading-none focus:bg-background focus:ring-1 focus:ring-primary disabled:opacity-100';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <span className="text-sm italic text-muted-foreground">{meta.label}</span>
          <div className="flex items-baseline gap-1">
            <NumberField
              aria-label={`${meta.label} atuais`}
              value={value.current}
              onChange={v => set({ current: v })}
              allowNegative
              max={value.max > 0 ? value.max : undefined}
              disabled={readOnly}
              className={cn(field, size === 'lg' ? 'w-[3.2ch] text-[36px]' : 'w-[3.2ch] text-[26px]')}
            />
            <span className="text-muted-foreground">/</span>
            <NumberField
              aria-label={`${meta.label} máximos`}
              value={value.max}
              onChange={v => set({ max: v })}
              min={0}
              disabled={readOnly}
              className={cn(field, 'w-[3ch] text-xl text-muted-foreground')}
            />
          </div>
        </div>
        <label className="ml-auto flex flex-col items-end gap-0.5">
          <span className="text-sm italic text-muted-foreground">{size === 'lg' ? 'Temporários' : 'Temp.'}</span>
          <NumberField
            aria-label={`${meta.label} temporários`}
            value={value.temp}
            onChange={v => set({ temp: v })}
            min={0}
            disabled={readOnly}
            className={cn(field, 'h-10 rounded-md border border-border/60 text-xl', size === 'lg' ? 'w-16' : 'w-12')}
          />
        </label>
      </div>
      <Bar value={value} label={meta.label} color={meta.color} tempColor={meta.temp} />
    </div>
  );
}

function Stat({ value, label, onClick, icon }: { value: string; label: string; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="flex min-h-[64px] flex-col items-center justify-center rounded-lg border border-hairline bg-background/40 px-1 py-1.5 transition-colors hover:border-primary/50">
      <span className="flex items-center gap-1 font-heading text-[20px] font-bold leading-tight">{icon}{value}</span>
      <span className="text-center text-sm italic leading-tight text-muted-foreground">{label}</span>
    </button>
  );
}

/** Defesa, Deslocamento, Tamanho e Penalidade de armadura. */
export function T20CombatNumbers({ className }: { className?: string }) {
  const { sheet, d, openPanel } = useT20();
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      <Stat value={String(d.defense)} label="Defesa" icon={<Shield className="h-4 w-4 text-primary-text" />} onClick={() => openPanel({ kind: 'defense' })} />
      <Stat value={sheet.speed || '—'} label="Deslocamento" onClick={() => openPanel({ kind: 'info' })} />
      <Stat value={d.size.name} label="Tamanho" onClick={() => openPanel({ kind: 'info' })} />
      <Stat value={d.penalty > 0 ? `−${d.penalty}` : '0'} label="Penalidade" onClick={() => openPanel({ kind: 'defense' })} />
    </div>
  );
}

/** Cartão de vitais (aba Combate no celular, Combate no computador). */
export function T20VitalsCard({ className, title }: { className?: string; title?: string }) {
  return (
    <section className={cn('flex flex-col gap-3 rounded-xl border border-hairline bg-card p-3.5', className)}>
      {title && <span className="text-sm italic text-muted-foreground">{title}</span>}
      <ResourceBlock kind="hp" />
      <ResourceBlock kind="mp" />
      <T20CombatNumbers />
    </section>
  );
}

/** PV / PM / Defesa compactos (faixa do celular, barra superior). */
export function T20InlineVitals({ className }: { className?: string }) {
  const { sheet, update, readOnly, d } = useT20();
  const item = (kind: 'hp' | 'mp') => {
    const v = sheet[kind] ?? { current: 0, max: 0, temp: 0 };
    return (
      <span className="flex items-baseline gap-1">
        <span className="text-sm italic text-muted-foreground">{RESOURCES[kind].short}</span>
        <NumberField
          aria-label={`${RESOURCES[kind].label} atuais`}
          value={v.current}
          allowNegative
          max={v.max > 0 ? v.max : undefined}
          disabled={readOnly}
          onChange={c => update({ [kind]: { ...v, current: c } } as never)}
          className="w-[3ch] rounded font-heading text-lg font-bold focus:bg-background focus:ring-1 focus:ring-primary disabled:opacity-100"
        />
        <span className="text-sm text-muted-foreground">/ {v.max}</span>
      </span>
    );
  };
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {item('hp')}
      {item('mp')}
      <span className="flex items-center gap-1">
        <Shield className="h-4 w-4 text-primary-text" />
        <span className="text-sm italic text-muted-foreground">Defesa</span>
        <strong className="font-heading text-lg">{d.defense}</strong>
      </span>
    </div>
  );
}

export function T20CompactVitals() {
  const { sheet } = useT20();
  return (
    <div className="shrink-0 border-b border-border/40 bg-surface px-3 pb-2 pt-1">
      <T20InlineVitals className="justify-between" />
      <div className="mt-1.5 grid grid-cols-2 gap-3">
        <Bar value={sheet.hp} label="Pontos de vida" color="bg-hp" tempColor="bg-hp-temp" className="h-1.5" />
        <Bar value={sheet.mp} label="Pontos de mana" color="bg-primary" tempColor="bg-primary/50" className="h-1.5" />
      </div>
    </div>
  );
}

/* ── Atributos e perícias ─────────────────────────────────── */

export function T20Attributes({ columns = 3 }: { columns?: 2 | 3 }) {
  const { sheet, openPanel } = useT20();
  return (
    <SheetCard title="Atributos" id="atributos">
      <p className="-mt-2 text-sm italic text-muted-foreground">No Tormenta20, o valor do atributo já é o modificador.</p>
      <div className={cn('grid gap-2', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
        {T20_ATTRIBUTES.map(a => (
          <button key={a.key} type="button" onClick={() => openPanel({ kind: 'attribute', key: a.key })}
            aria-label={`${a.name}: ${fmt(sheet.attributes?.[a.key] ?? 0)}`}
            className="flex flex-col items-center rounded-lg border border-hairline bg-background/40 px-1 py-2 transition-colors hover:border-primary/50">
            <span className="font-heading text-[13px] font-bold tracking-[0.08em] text-muted-foreground">{a.abbr}</span>
            <span className="font-heading text-[26px] font-bold leading-tight text-primary-text">{fmt(sheet.attributes?.[a.key] ?? 0)}</span>
            <span className="text-sm text-muted-foreground">{a.name}</span>
          </button>
        ))}
      </div>
    </SheetCard>
  );
}

export function T20Skills({ className, gridClass, dense }: { className?: string; gridClass?: string; dense?: boolean }) {
  const { d, openPanel } = useT20();
  return (
    <SheetCard title="Perícias" meta={`½ nível ${fmt(d.half)} · treino ${fmt(d.training)}`} className={className}>
      <p className="-mt-2 text-sm italic text-muted-foreground">
        ® somente treinada · ✝ penalidade de armadura{d.penalty > 0 ? ` (−${d.penalty} aplicada)` : ''}
      </p>
      <div className={cn('flex flex-col', gridClass)}>
        {T20_SKILLS.map(def => {
          const st = d.skillState(def);
          const total = d.skill(def);
          const changed = st.attribute !== def.attribute;
          return (
            <button key={def.key} type="button" onClick={() => openPanel({ kind: 'skill', key: def.key })}
              className={cn('flex w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-primary/5', dense ? 'min-h-[36px]' : 'min-h-[44px]')}>
              <span className={cn('inline-block h-2 w-2 shrink-0 rotate-45', st.trained ? 'bg-primary' : 'border border-muted-foreground/50')}
                aria-label={st.trained ? 'treinada' : 'não treinada'} />
              <span className={cn('min-w-0 truncate text-base', !st.trained && 'text-muted-foreground')}>
                {def.name}
                {def.hasSpecialty && st.specialty ? ` (${st.specialty})` : ''}
                {def.trainedOnly && <sup className="ml-0.5 text-primary-text/80" title="Somente treinada">®</sup>}
                {def.armorPenalty && <sup className="ml-0.5 text-primary-text/80" title="Sofre penalidade de armadura">✝</sup>}
              </span>
              <span className={cn('text-sm', changed ? 'text-primary-text' : 'text-muted-foreground')}>{abbr(st.attribute)}</span>
              {(st.other ?? 0) !== 0 && (
                <span title="Inclui outros bônus" className="inline-block h-[7px] w-[7px] rotate-45 bg-hp-temp-foreground" />
              )}
              <span className={cn('ml-auto font-heading text-[17px] font-bold', total === null && 'text-muted-foreground/60')}
                title={total === null ? 'Somente treinada: não pode ser usada sem treino' : undefined}>
                {total === null ? 'ND' : formatBonus(total)}
              </span>
            </button>
          );
        })}
      </div>
    </SheetCard>
  );
}

/* ── Ataques ──────────────────────────────────────────────── */

const ATTACK_FIELDS: { key: keyof Omit<T20Attack, 'id' | 'notes'>; label: string; placeholder: string; max: number }[] = [
  { key: 'name', label: 'Ataque', placeholder: 'Espada longa', max: 100 },
  { key: 'attackBonus', label: 'Teste', placeholder: '+5', max: 30 },
  { key: 'damage', label: 'Dano', placeholder: '1d8+3', max: 50 },
  { key: 'critical', label: 'Crítico', placeholder: '19/x2', max: 30 },
  { key: 'damageType', label: 'Tipo', placeholder: 'Corte', max: 50 },
  { key: 'range', label: 'Alcance', placeholder: 'Corpo a corpo', max: 50 },
];

const newAttack = (): T20Attack => ({
  id: crypto.randomUUID(), name: '', attackBonus: '', damage: '', critical: '', damageType: '', range: '', notes: '',
});

export function T20Attacks({ table, className, maxHeightClass }: { table?: boolean; className?: string; maxHeightClass?: string }) {
  const { sheet, update, readOnly } = useT20();
  const attacks = sheet.attacks ?? [];
  const cols = 'grid grid-cols-[minmax(0,1.6fr)_64px_minmax(0,0.9fr)_72px_minmax(0,0.8fr)_minmax(0,1fr)] gap-3';
  return (
    <SheetCard id="ataques" title="Ataques" meta={`${attacks.length} ${attacks.length === 1 ? 'ataque' : 'ataques'}`} className={className}>
      <div className={cn(maxHeightClass, maxHeightClass && 'overflow-y-auto pr-1')}>
        <ExpandableList<T20Attack>
          items={attacks}
          onChange={list => update({ attacks: list })}
          createItem={newAttack}
          addLabel="Novo ataque"
          emptyText="Nenhum ataque adicionado."
          readOnly={readOnly}
          header={table && attacks.length > 0 ? (
            <div className={cn(cols, 'px-3 pr-10 text-sm italic text-muted-foreground')}>
              {ATTACK_FIELDS.map(f => <span key={f.key}>{f.label}</span>)}
            </div>
          ) : undefined}
          renderSummary={a => table ? (
            <div className={cn(cols, 'items-center text-base')}>
              <span className={cn('truncate font-semibold', !a.name && 'font-normal italic text-muted-foreground')}>{a.name || 'Novo ataque'}</span>
              <span className="truncate font-heading font-bold text-primary-text">{a.attackBonus || '—'}</span>
              <span className="truncate">{a.damage || '—'}</span>
              <span className="truncate">{a.critical || '—'}</span>
              <span className="truncate text-muted-foreground">{a.damageType || '—'}</span>
              <span className="truncate text-muted-foreground">{a.range || '—'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={cn('min-w-0 flex-1 truncate text-base font-semibold', !a.name && 'font-normal italic text-muted-foreground')}>
                {a.name || 'Novo ataque'}
              </span>
              <span className="shrink-0 font-heading font-bold text-primary-text">{a.attackBonus}</span>
              <span className="shrink-0">{a.damage}</span>
              {a.critical && <span className="shrink-0 text-sm text-muted-foreground">{a.critical}</span>}
            </div>
          )}
          renderForm={(a, set) => (
            <div className="grid grid-cols-2 gap-3">
              {ATTACK_FIELDS.map(f => (
                <TextField key={f.key} label={f.label} value={a[f.key]} placeholder={f.placeholder} maxLength={f.max}
                  className={f.key === 'name' ? 'col-span-2' : undefined} onChange={v => set({ [f.key]: v })} />
              ))}
            </div>
          )}
        />
      </div>
    </SheetCard>
  );
}

/* ── Habilidades, proficiências e textos ───────────────────── */

export function T20Abilities({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useT20();
  return (
    <>
      <EntryListCard id="poderes" title="Habilidades de raça e origem" items={sheet.raceOriginAbilities}
        onChange={raceOriginAbilities => update({ raceOriginAbilities })} readOnly={readOnly}
        addLabel="Nova habilidade" newItemLabel="Nova habilidade" emptyText="Nenhuma habilidade de raça ou origem."
        descriptionPlaceholder="O que faz, custo em PM, pré-requisitos…" className={className} />
      <EntryListCard title="Habilidades de classe e poderes" items={sheet.classAbilities}
        onChange={classAbilities => update({ classAbilities })} readOnly={readOnly}
        addLabel="Novo poder" newItemLabel="Novo poder" emptyText="Nenhuma habilidade de classe ou poder."
        descriptionPlaceholder="O que faz, custo em PM, pré-requisitos…" className={className} />
    </>
  );
}

export function T20Proficiencies({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useT20();
  return (
    <TextBlockCard id="proficiencies" title="Proficiências" value={sheet.proficiencies} readOnly={readOnly} maxLength={2000}
      placeholder="Armas simples, armaduras leves, escudos…" className={className} onChange={v => update({ proficiencies: v })} />
  );
}

export function T20Story({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useT20();
  return (
    <>
      <TextBlockCard id="description" anchor="historia" title="Descrição" value={sheet.description} readOnly={readOnly}
        placeholder="Aparência, personalidade, maneirismos…" className={className} onChange={v => update({ description: v })} />
      <TextBlockCard id="history" title="Histórico" value={sheet.history} readOnly={readOnly}
        placeholder="De onde veio, o que busca…" className={className} onChange={v => update({ history: v })} />
    </>
  );
}

/** Anotações (privadas: somem no somente leitura, como na v1). */
export function T20Notes({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useT20();
  if (readOnly) return null;
  return (
    <TextBlockCard id="notes" title="Anotações" value={sheet.notes} readOnly={readOnly}
      placeholder="Negócios, parceiros, tesouros, aliados…" className={className} onChange={v => update({ notes: v })} />
  );
}

/* ── Magias ───────────────────────────────────────────────── */

const CIRCLES: T20SpellCircle[] = [1, 2, 3, 4, 5];
const SPELL_FIELDS: { key: 'school' | 'execution' | 'range' | 'target' | 'duration' | 'resistance'; label: string; placeholder: string }[] = [
  { key: 'school', label: 'Escola', placeholder: 'Evocação' },
  { key: 'execution', label: 'Execução', placeholder: 'Padrão' },
  { key: 'range', label: 'Alcance', placeholder: 'Curto' },
  { key: 'target', label: 'Alvo / Área', placeholder: '1 criatura' },
  { key: 'duration', label: 'Duração', placeholder: 'Instantânea' },
  { key: 'resistance', label: 'Resistência', placeholder: 'Vontade anula' },
];
const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function T20SpellHeader({ className }: { className?: string }) {
  const { sheet, d, openPanel, readOnly } = useT20();
  const box = 'flex min-h-[64px] flex-col justify-center rounded-lg border border-hairline bg-background/40 px-3 py-1.5';
  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      <button type="button" onClick={() => openPanel({ kind: 'castAttr' })} disabled={readOnly}
        aria-label="Alterar atributo-chave das magias"
        className="flex min-h-[64px] flex-col justify-center rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-left hover:bg-primary/10 disabled:cursor-default">
        <span className="text-sm italic text-muted-foreground">Atributo</span>
        <span className="flex items-center gap-1 font-heading text-[20px] font-bold text-primary-text">
          {abbr(d.castAttr)}{!readOnly && <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      <div className={box}>
        <span className="text-sm italic text-muted-foreground">Modificador</span>
        <span className="font-heading text-[20px] font-bold">{fmt(sheet.attributes?.[d.castAttr] ?? 0)}</span>
      </div>
      <div className={box}>
        <span className="text-sm italic text-muted-foreground" title="Teste de resistência das magias">CD</span>
        <span className="font-heading text-[20px] font-bold">{d.spellDC}</span>
      </div>
    </div>
  );
}

function SpellForm({ s, set }: { s: T20Spell; set: (p: Partial<T20Spell>) => void }) {
  return (
    <>
      <div className="grid grid-cols-[1fr_130px] gap-3">
        <TextField label="Nome" value={s.name} placeholder="Nome" maxLength={120} onChange={v => set({ name: v })} />
        <SelectField<number> label="Círculo" value={s.circle} options={CIRCLES.map(c => ({ value: c, label: `${c}º círculo` }))}
          onChange={v => set({ circle: v as T20SpellCircle })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SPELL_FIELDS.map(f => (
          <TextField key={f.key} label={f.label} value={s[f.key]} placeholder={f.placeholder} maxLength={100} onChange={v => set({ [f.key]: v })} />
        ))}
      </div>
      <TextAreaField label="Efeito" value={s.description} placeholder="Efeito e aprimoramentos (+PM)…" maxLength={5000} minRows={4}
        onChange={v => set({ description: v })} />
    </>
  );
}

export function T20SpellsList({ className, bare, lead }: { className?: string; bare?: boolean; lead?: React.ReactNode }) {
  const { sheet, update, readOnly } = useT20();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const ed = useListEditing<T20Spell>(sheet.spells, list => update({ spells: list }), () => ({
    id: crypto.randomUUID(), circle: (filter === 'all' ? 1 : Number(filter)) as T20SpellCircle,
    name: '', school: '', execution: '', range: '', target: '', duration: '', resistance: '', description: '',
  }));
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return q ? ed.list.filter(s => normalize(`${s.name} ${s.school} ${s.description}`).includes(q)) : ed.list;
  }, [ed.list, query]);
  const present = CIRCLES.filter(c => ed.list.some(s => s.circle === c));
  const chips = [{ value: 'all', label: 'Todas' }, ...present.map(c => ({ value: String(c), label: `${c}º` }))];
  const active = chips.some(c => c.value === filter) ? filter : 'all';
  const groups = CIRCLES.filter(c => visible.some(s => s.circle === c) && (active === 'all' || String(c) === active));

  return (
    <SheetCard id="magias" title="Magias" meta={`${ed.list.length} ${ed.list.length === 1 ? 'magia' : 'magias'}`} className={className} bare={bare}>
      {lead}
      {!readOnly && <AddButton label="Nova magia" onClick={() => { setQuery(''); ed.add(); }} />}
      {ed.list.length > 6 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <input aria-label="Buscar magia" placeholder="Buscar por nome, escola ou efeito…" value={query}
            onChange={e => setQuery(e.target.value)} className={cn(inputClass, 'pl-9')} />
        </div>
      )}
      {present.length > 0 && <ChipFilter ariaLabel="Filtrar por círculo" options={chips} value={active} onChange={setFilter} />}
      {ed.list.length === 0 && <p className="py-2 text-center text-[15px] italic text-muted-foreground">Nenhuma magia anotada.</p>}
      {groups.map(c => {
        const inCircle = visible.filter(s => s.circle === c);
        const total = ed.list.filter(s => s.circle === c).length;
        return (
          <div key={c} className="flex flex-col gap-2">
            <h3 className="flex items-baseline gap-2 pt-1 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {c}º círculo
              <span className="font-body text-sm font-normal normal-case tracking-normal">
                {SPELL_CIRCLE_COST[c]} PM · {total} {total === 1 ? 'magia' : 'magias'}
              </span>
            </h3>
            {inCircle.map(s => (
              <ExpandableItem
                key={s.id}
                open={ed.openId === s.id}
                onToggle={() => ed.toggle(s.id)}
                autoFocus={ed.focusId === s.id}
                summary={
                  <span className="flex min-w-0 flex-col">
                    <span className={cn('truncate text-base font-semibold', !s.name && 'font-normal italic text-muted-foreground')}>{s.name || 'Nova magia'}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {[s.school, s.execution, s.range, s.duration].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </span>
                }
              >
                <fieldset disabled={readOnly} className="contents"><SpellForm s={s} set={p => ed.update(s.id, p)} /></fieldset>
                {!readOnly && <DeleteAction onConfirm={() => ed.remove(s.id)} />}
              </ExpandableItem>
            ))}
          </div>
        );
      })}
    </SheetCard>
  );
}

/* ── Equipamento ──────────────────────────────────────────── */

const newItem = (): T20Item => ({ id: crypto.randomUUID(), name: '', quantity: 1, spaces: 1, worn: false, notes: '' });
const dec = (n: number) => String(n).replace('.', ',');

export function T20Equipment({ className, table }: { className?: string; table?: boolean }) {
  const { sheet, update, readOnly, d } = useT20();
  const items = sheet.equipment ?? [];
  const overloaded = d.load > d.carry;
  const tooMany = d.worn > MAX_WORN_ITEMS;
  const money = sheet.money ?? { ts: 0, to: 0 };
  const cols = 'grid grid-cols-[52px_minmax(0,2fr)_56px_72px_minmax(0,1.5fr)] gap-3';
  const stat = (label: string, value: string, bad?: boolean, title?: string) => (
    <div title={title} className={cn('flex min-h-[60px] flex-col justify-center rounded-lg border bg-background/40 px-3', bad ? 'border-hp/60 text-hp' : 'border-hairline')}>
      <span className="text-sm italic text-muted-foreground">{label}</span>
      <span className="font-heading text-lg font-bold">{value}</span>
    </div>
  );
  return (
    <SheetCard id="inventario" title="Equipamento" className={className}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {stat('Carga', `${dec(d.load)} / ${d.carry}`, overloaded)}
        {stat('Levantar', String(d.lift), false, 'O dobro da carga máxima')}
        {stat('Vestidos', `${d.worn} / ${MAX_WORN_ITEMS}`, tooMany)}
        <NumberInputField label="T$" value={money.ts} min={0} maxDigits={7} onChange={ts => update({ money: { ...money, ts } })} />
        <NumberInputField label="TO" value={money.to} min={0} maxDigits={7} onChange={to => update({ money: { ...money, to } })} />
      </div>
      {(overloaded || tooMany) && (
        <p className="flex items-start gap-2 rounded-md border border-hp/40 bg-hp/10 px-3 py-2 text-[15px]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-hp" />
          <span>
            {overloaded && 'Acima da carga máxima: o personagem está sobrecarregado. '}
            {tooMany && `Só ${MAX_WORN_ITEMS} itens vestidos dão seus benefícios ao mesmo tempo.`}
          </span>
        </p>
      )}
      <ExpandableList<T20Item>
        items={items}
        onChange={list => update({ equipment: list })}
        createItem={newItem}
        addLabel="Novo item"
        emptyText="Nenhum item adicionado."
        readOnly={readOnly}
        header={table && items.length > 0 ? (
          <div className={cn(cols, 'px-3 pr-10 text-sm italic text-muted-foreground')}>
            <span>Vest.</span><span>Item</span><span>Qtd.</span><span>Espaços</span><span>Notas</span>
          </div>
        ) : undefined}
        renderSummary={it => table ? (
          <div className={cn(cols, 'items-center text-base')}>
            <span>{it.worn ? '✓' : ''}</span>
            <span className={cn('truncate font-semibold', !it.name && 'font-normal italic text-muted-foreground')}>{it.name || 'Novo item'}</span>
            <span>{it.quantity}</span>
            <span>{dec(it.spaces ?? 0)}</span>
            <span className="truncate text-muted-foreground">{it.notes}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-9 shrink-0 font-heading font-bold text-muted-foreground">×{it.quantity}</span>
            <span className={cn('min-w-0 flex-1 truncate text-base font-semibold', !it.name && 'font-normal italic text-muted-foreground')}>
              {it.name || 'Novo item'}
            </span>
            {it.worn && <span className="shrink-0 rounded border border-primary/50 px-1.5 text-xs text-primary-text">vestido</span>}
            <span className="shrink-0 text-sm text-muted-foreground">{dec(it.spaces ?? 0)} esp.</span>
          </div>
        )}
        renderForm={(it, set) => (
          <>
            <TextField label="Item" value={it.name} placeholder="Item" maxLength={120} onChange={v => set({ name: v })} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInputField label="Quantidade" value={it.quantity ?? 1} min={0} maxDigits={4} onChange={v => set({ quantity: v })} />
              <NumberInputField label="Espaços" value={it.spaces ?? 0} min={0} decimal maxDigits={3} onChange={v => set({ spaces: Math.round(v * 10) / 10 })} />
            </div>
            <CheckField label="Vestido" checked={it.worn} onChange={v => set({ worn: v })} />
            <TextField label="Notas" value={it.notes} placeholder="Notas" maxLength={300} onChange={v => set({ notes: v })} />
          </>
        )}
      />
    </SheetCard>
  );
}
