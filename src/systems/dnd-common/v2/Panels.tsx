import type { AbilityKey } from '@/types/character';
import { cn } from '@/lib/utils';
import { Panel } from '@/systems/shared/ui/Panel';
import { Stepper } from '@/systems/shared/ui/Stepper';
import { NumberInputField, TextField } from '@/systems/shared/ui/fields';
import { getSpellAttackBonus, getSpellSaveDC } from '@/utils/calculations';
import { ABILITY_KEYS, ABILITY_LABELS, fmt, useDndSheet, type PanelRequest } from './context';

/*
 * Painéis da ficha (docs/redesign-v2/03-ficha.md, "Painéis"). No modo somente
 * leitura os painéis abrem para mostrar o cálculo, sem controles de edição.
 */

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={cn('flex min-h-[40px] items-center justify-between gap-3', strong && 'border-t border-hairline pt-2')}>
      <span className={cn('text-base', strong ? 'font-heading font-bold' : 'text-muted-foreground')}>{k}</span>
      <span className={cn('font-heading font-bold', strong ? 'text-2xl text-primary-text' : 'text-lg')}>{v}</span>
    </div>
  );
}

function Segmented<V extends string | boolean | number>({ label, options, value, onChange, disabled }: {
  label: string;
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm italic text-muted-foreground">{label}</span>
      <div role="group" aria-label={label} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map(o => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => onChange(o.value)}
              className={cn(
                'h-11 rounded-md border px-2 text-[15px] transition-colors disabled:cursor-default',
                on ? 'border-primary bg-primary/15 text-primary-text' : 'border-hairline text-muted-foreground',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BonusRow({ value, onChange, readOnly }: { value: number; onChange: (v: number) => void; readOnly: boolean }) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-3">
      <span className="flex flex-col">
        <span className="text-base">Bônus adicional</span>
        <span className="text-sm italic text-muted-foreground">antecedente, item, talento…</span>
      </span>
      {readOnly
        ? <span className="font-heading text-lg font-bold">{fmt(value)}</span>
        : <Stepper value={value} onChange={onChange} allowNegative showPlus label="bônus adicional" />}
    </div>
  );
}

function InfoBody() {
  const { sheet, update } = useDndSheet();
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberInputField label="CA" value={sheet.armorClass} onChange={v => update({ armorClass: v })} min={0} />
      <NumberInputField label="Deslocamento (m)" value={sheet.speed} onChange={v => update({ speed: v })} min={0} />
      <TextField label="Tamanho" value={sheet.size} onChange={v => update({ size: v })} />
      <TextField
        label="Dado de vida (total)"
        value={sheet.hitDice?.total}
        placeholder="11d8"
        onChange={v => update({ hitDice: { ...sheet.hitDice, total: v } })}
      />
      <p className="col-span-2 text-sm italic text-muted-foreground">
        Iniciativa e proficiência são calculadas; toque nelas para ver o cálculo e o bônus adicional.
      </p>
    </div>
  );
}

function CastBody() {
  const { sheet, update, d, closePanel, readOnly } = useDndSheet();
  const options: { key: AbilityKey | ''; label: string }[] = [
    { key: '', label: 'Nenhum' },
    ...ABILITY_KEYS.map(k => ({ key: k, label: ABILITY_LABELS[k] })),
  ];
  return (
    <div className="flex flex-col gap-2">
      {options.map(o => {
        const on = (sheet.spellcastingAbility || '') === o.key;
        const m = o.key ? d.mod(o.key) : null;
        return (
          <button
            key={o.key || 'none'}
            type="button"
            aria-pressed={on}
            disabled={readOnly}
            onClick={() => { update({ spellcastingAbility: o.key }); closePanel(); }}
            className={cn(
              'flex min-h-[52px] items-center gap-2 rounded-lg border px-3.5 text-left text-base transition-colors disabled:cursor-default',
              on ? 'border-primary bg-primary/15 text-primary-text' : 'border-hairline',
            )}
          >
            <span>{o.label}</span>
            {m !== null && <span className="text-muted-foreground">({fmt(m)})</span>}
            <span className="ml-auto text-sm text-muted-foreground">
              {m === null ? 'sem conjuração' : `CD ${getSpellSaveDC(m, d.prof)} · Ataque ${fmt(getSpellAttackBonus(m, d.prof))}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SlotsBody() {
  const { sheet, update, readOnly } = useDndSheet();
  const slot = (lv: number) => sheet.spellSlots?.[lv] ?? { total: 0, used: 0 };
  const set = (lv: number, patch: Partial<{ total: number; used: number }>) => {
    const next = { ...slot(lv), ...patch };
    if (next.used > next.total) next.used = next.total;
    update({ spellSlots: { ...sheet.spellSlots, [lv]: next } });
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[48px_1fr_1fr] gap-2 text-sm italic text-muted-foreground">
        <span />
        <span className="text-center">Usados</span>
        <span className="text-center">Total</span>
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lv => (
        <div key={lv} className="grid grid-cols-[48px_1fr_1fr] items-center gap-2">
          <span className="font-heading font-bold">{lv}º</span>
          <Stepper className="justify-center" value={slot(lv).used} min={0} max={slot(lv).total}
            onChange={v => set(lv, { used: v })} label={`espaços usados do ${lv}º círculo`} disabled={readOnly} />
          <Stepper className="justify-center" value={slot(lv).total} min={0} max={9}
            onChange={v => set(lv, { total: v })} label={`espaços do ${lv}º círculo`} disabled={readOnly} />
        </div>
      ))}
    </div>
  );
}

function CalcBody({ p }: { p: PanelRequest }) {
  const { sheet, update, d, readOnly } = useDndSheet();
  const bonuses = sheet.bonuses ?? { proficiencyBonus: 0, initiative: 0, savingThrows: {}, skills: {} };
  const setBonuses = (patch: Partial<typeof bonuses>) => update({ bonuses: { ...bonuses, ...patch } });

  if (p.kind === 'initiative') {
    return (
      <div className="flex flex-col gap-2">
        <Row k="Modificador de Destreza" v={fmt(d.mod('dexterity'))} />
        <BonusRow value={bonuses.initiative ?? 0} readOnly={readOnly} onChange={v => setBonuses({ initiative: v })} />
        <Row k="Total" v={fmt(d.initiative)} strong />
      </div>
    );
  }

  if (p.kind === 'proficiency') {
    return (
      <div className="flex flex-col gap-2">
        <Row k={`Pelo nível ${sheet.level}`} v={fmt(d.profBase)} />
        <BonusRow value={bonuses.proficiencyBonus ?? 0} readOnly={readOnly} onChange={v => setBonuses({ proficiencyBonus: v })} />
        <Row k="Total" v={fmt(d.prof)} strong />
        <p className="text-sm italic text-muted-foreground">
          Afeta perícias, salvaguardas, CD e ataque de magia e o limite de itens sintonizados.
        </p>
      </div>
    );
  }

  if (p.kind === 'ability') {
    const k = p.key;
    const ab = sheet.abilities[k];
    const setAbility = (patch: Partial<typeof ab>) => update({ abilities: { ...sheet.abilities, [k]: { ...ab, ...patch } } });
    return (
      <div className="flex flex-col gap-3">
        <div className="flex min-h-[48px] items-center justify-between gap-3">
          <span className="text-base">Valor do atributo</span>
          {readOnly
            ? <span className="font-heading text-lg font-bold">{ab.value}</span>
            : <Stepper value={ab.value} min={1} max={30} onChange={v => setAbility({ value: v })} label="valor do atributo" />}
        </div>
        <Segmented
          label="Salvaguarda"
          disabled={readOnly}
          value={ab.proficient}
          onChange={v => setAbility({ proficient: v })}
          options={[{ value: false, label: 'Sem proficiência' }, { value: true, label: 'Proficiente' }]}
        />
        <Row k={`Modificador de ${ABILITY_LABELS[k]}`} v={fmt(d.mod(k))} />
        <Row k="Proficiência" v={ab.proficient ? fmt(d.prof) : '—'} />
        <BonusRow
          value={d.saveBonus(k)}
          readOnly={readOnly}
          onChange={v => setBonuses({ savingThrows: { ...bonuses.savingThrows, [k]: v } })}
        />
        <Row k="Salvaguarda" v={fmt(d.save(k))} strong />
      </div>
    );
  }

  if (p.kind === 'skill') {
    const idx = sheet.skills.findIndex(s => s.name === p.name);
    const s = sheet.skills[idx];
    if (!s) return null;
    const level = s.expertise ? 2 : s.proficient ? 1 : 0;
    const setLevel = (lv: number) => {
      const skills = [...sheet.skills];
      skills[idx] = { ...s, proficient: lv >= 1, expertise: lv === 2 };
      update({ skills });
    };
    return (
      <div className="flex flex-col gap-3">
        <Segmented
          label="Treinamento"
          disabled={readOnly}
          value={level}
          onChange={setLevel}
          options={[{ value: 0, label: 'Nenhum' }, { value: 1, label: 'Proficiente' }, { value: 2, label: 'Especialista' }]}
        />
        <Row k={`Modificador de ${ABILITY_LABELS[s.ability]}`} v={fmt(d.mod(s.ability))} />
        <Row
          k={level === 2 ? 'Especialização (2 × prof.)' : 'Proficiência'}
          v={level ? fmt(level === 2 ? d.prof * 2 : d.prof) : '—'}
        />
        <BonusRow
          value={d.skillBonus(s.name)}
          readOnly={readOnly}
          onChange={v => setBonuses({ skills: { ...bonuses.skills, [s.name]: v } })}
        />
        <Row k="Total" v={fmt(d.skill(s.name))} strong />
      </div>
    );
  }
  return null;
}

function titleOf(p: PanelRequest, skillLabel?: string): string {
  switch (p.kind) {
    case 'info': return 'Informações gerais';
    case 'cast': return 'Atributo de conjuração';
    case 'slots': return 'Espaços de magia';
    case 'initiative': return 'Iniciativa';
    case 'proficiency': return 'Proficiência';
    case 'ability': return ABILITY_LABELS[p.key];
    case 'skill': return skillLabel ?? p.name;
  }
}

/** Renderiza o painel pedido por `openPanel`. Coloque uma vez por layout. */
export function DndPanels() {
  const { panel, closePanel, readOnly } = useDndSheet();
  // No somente leitura não abrimos painéis só de edição.
  const p = panel && readOnly && (panel.kind === 'info' || panel.kind === 'slots') ? null : panel;
  return (
    <Panel open={!!p} onOpenChange={open => { if (!open) closePanel(); }} title={p ? titleOf(p) : ''}>
      {p?.kind === 'info' && <InfoBody />}
      {p?.kind === 'cast' && <CastBody />}
      {p?.kind === 'slots' && <SlotsBody />}
      {p && ['initiative', 'proficiency', 'ability', 'skill'].includes(p.kind) && <CalcBody p={p} />}
    </Panel>
  );
}
