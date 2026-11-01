import { cn } from '@/lib/utils';
import { Panel } from '@/systems/shared/ui/Panel';
import { Stepper } from '@/systems/shared/ui/Stepper';
import { CheckField, NumberInputField, SelectField, TextField } from '@/systems/shared/ui/fields';
import { formatBonus, T20_ATTRIBUTES, T20_SIZES } from '../rules';
import { skillState as stateOf, type T20SkillDefinition } from '../skills';
import type { T20ArmorPiece, T20Attribute, T20Sheet, T20Size, T20SkillState } from '../types';
import { T20_SKILLS, useT20, type T20Panel } from './context';

/*
 * Painéis da ficha Tormenta20. Mesma regra das fichas D&D: no somente
 * leitura os painéis abrem para mostrar o cálculo, sem controles.
 */

const attrName = (k: T20Attribute) => T20_ATTRIBUTES.find(a => a.key === k)?.name ?? k;
const attrAbbr = (k: T20Attribute) => T20_ATTRIBUTES.find(a => a.key === k)?.abbr ?? k;

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={cn('flex min-h-[40px] items-center justify-between gap-3', strong && 'border-t border-hairline pt-2')}>
      <span className={cn('text-base', strong ? 'font-heading font-bold' : 'text-muted-foreground')}>{k}</span>
      <span className={cn('font-heading font-bold', strong ? 'text-2xl text-primary-text' : 'text-lg')}>{v}</span>
    </div>
  );
}

function AttributePicker({ label, value, onChange, disabled }: {
  label: string; value: T20Attribute; onChange: (k: T20Attribute) => void; disabled?: boolean;
}) {
  const { sheet } = useT20();
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm italic text-muted-foreground">{label}</span>
      <div role="group" aria-label={label} className="grid grid-cols-6 gap-1.5">
        {T20_ATTRIBUTES.map(a => {
          const on = a.key === value;
          return (
            <button key={a.key} type="button" aria-pressed={on} disabled={disabled} onClick={() => onChange(a.key)}
              title={`${a.name} (${formatBonus(sheet.attributes?.[a.key] ?? 0)})`}
              className={cn('flex h-12 flex-col items-center justify-center rounded-md border text-sm transition-colors disabled:cursor-default',
                on ? 'border-primary bg-primary/15 text-primary-text' : 'border-hairline text-muted-foreground')}>
              <span className="font-heading font-bold">{a.abbr}</span>
              <span className="text-xs">{formatBonus(sheet.attributes?.[a.key] ?? 0)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepRow({ label, hint, value, onChange, min, max, readOnly }: {
  label: string; hint?: string; value: number; onChange: (v: number) => void; min?: number; max?: number; readOnly: boolean;
}) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-3">
      <span className="flex flex-col">
        <span className="text-base">{label}</span>
        {hint && <span className="text-sm italic text-muted-foreground">{hint}</span>}
      </span>
      {readOnly
        ? <span className="font-heading text-lg font-bold">{formatBonus(value)}</span>
        : <Stepper value={value} onChange={onChange} min={min} max={max} allowNegative={min === undefined || min < 0} showPlus label={label.toLowerCase()} />}
    </div>
  );
}

function AttributeBody({ k }: { k: T20Attribute }) {
  const { sheet, update, readOnly } = useT20();
  const value = sheet.attributes?.[k] ?? 0;
  return (
    <div className="flex flex-col gap-3">
      <StepRow label="Valor" hint="No T20, o atributo já é o modificador (−10 a 20)" value={value} min={-10} max={20} readOnly={readOnly}
        onChange={v => update({ attributes: { ...sheet.attributes, [k]: v } })} />
      <p className="text-sm italic text-muted-foreground">
        Somado às perícias de {attrName(k)} e, quando for o atributo-chave, à CD das magias.
      </p>
    </div>
  );
}

function ArmorFields({ label, value, onChange }: { label: string; value: T20ArmorPiece; onChange: (v: T20ArmorPiece) => void }) {
  const v = value ?? { name: '', bonus: 0, penalty: 0 };
  return (
    <div className="grid grid-cols-[1fr_72px_72px] gap-2">
      <TextField label={label} value={v.name} placeholder="Nenhum" maxLength={100} onChange={name => onChange({ ...v, name })} />
      <NumberInputField label="Defesa" value={v.bonus ?? 0} allowNegative onChange={bonus => onChange({ ...v, bonus })} />
      <NumberInputField label="Penal." value={v.penalty ?? 0} min={0} onChange={penalty => onChange({ ...v, penalty })} />
    </div>
  );
}

function DefenseBody() {
  const { sheet, update, readOnly, d } = useT20();
  const def = sheet.defense ?? { attribute: 'des' as T20Attribute, other: 0, heavyArmor: false, attributeLimit: 0 };
  const setDef = (p: Partial<T20Sheet['defense']>) => update({ defense: { ...def, ...p } });
  const attr = sheet.attributes?.[def.attribute] ?? 0;
  const attrPart = def.heavyArmor ? Math.max(0, Math.min(attr, def.attributeLimit ?? 0)) : attr;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <Row k="Base" v="10" />
        <Row k={`${attrName(def.attribute)}${def.heavyArmor ? ` (limite ${def.attributeLimit ?? 0})` : ''}`} v={formatBonus(attrPart)} />
        <Row k={`Armadura${sheet.armor?.name ? ` · ${sheet.armor.name}` : ''}`} v={formatBonus(sheet.armor?.bonus ?? 0)} />
        <Row k={`Escudo${sheet.shield?.name ? ` · ${sheet.shield.name}` : ''}`} v={formatBonus(sheet.shield?.bonus ?? 0)} />
        <Row k="Outros" v={formatBonus(def.other ?? 0)} />
        <Row k="Defesa" v={String(d.defense)} strong />
        {d.penalty > 0 && <Row k="Penalidade de armadura (perícias ✝)" v={`−${d.penalty}`} />}
      </div>
      {!readOnly && (
        <>
          <AttributePicker label="Atributo da Defesa" value={def.attribute} onChange={attribute => setDef({ attribute })} />
          <CheckField label="Armadura pesada (limita o atributo)" checked={def.heavyArmor ?? false} onChange={heavyArmor => setDef({ heavyArmor })} />
          {def.heavyArmor && (
            <StepRow label="Limite do atributo" value={def.attributeLimit ?? 0} min={0} readOnly={readOnly}
              onChange={attributeLimit => setDef({ attributeLimit })} />
          )}
          <StepRow label="Outros" hint="poderes, itens, condições…" value={def.other ?? 0} readOnly={readOnly} onChange={other => setDef({ other })} />
          <ArmorFields label="Armadura" value={sheet.armor} onChange={armor => update({ armor })} />
          <ArmorFields label="Escudo" value={sheet.shield} onChange={shield => update({ shield })} />
        </>
      )}
    </div>
  );
}

function InfoBody() {
  const { sheet, update, d } = useT20();
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Deslocamento" value={sheet.speed} placeholder="9m" maxLength={50} onChange={speed => update({ speed })} />
        <SelectField<T20Size> label="Tamanho" value={sheet.size ?? 'medio'} options={T20_SIZES.map(s => ({ value: s.key, label: s.name }))}
          onChange={size => update({ size })} />
      </div>
      <Row k="Furtividade / Manobras" v={`${formatBonus(d.size.stealth)} / ${formatBonus(d.size.maneuver)}`} />
      <Row k="Penalidade de armadura" v={d.penalty > 0 ? `−${d.penalty}` : '0'} />
      <p className="text-sm italic text-muted-foreground">A penalidade vem de armadura e escudo; ajuste-os no painel da Defesa.</p>
    </div>
  );
}

function SkillBody({ def }: { def: T20SkillDefinition }) {
  const { sheet, update, readOnly, d } = useT20();
  const st = stateOf(sheet.skills, def);
  const set = (p: Partial<T20SkillState>) => update({ skills: { ...sheet.skills, [def.key]: { ...st, ...p } } });
  const total = d.skill(def);
  const penalty = def.armorPenalty ? d.penalty : 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <Row k="½ nível" v={formatBonus(d.half)} />
        <Row k="Treino" v={st.trained ? formatBonus(d.training) : '—'} />
        <Row k={attrName(st.attribute)} v={formatBonus(sheet.attributes?.[st.attribute] ?? 0)} />
        {penalty > 0 && <Row k="Penalidade de armadura" v={`−${penalty}`} />}
        <Row k="Outros" v={formatBonus(st.other ?? 0)} />
        <Row k={def.name} v={total === null ? 'ND' : formatBonus(total)} strong />
        {total === null && <p className="text-sm italic text-muted-foreground">Somente treinada: sem treino, a perícia não pode ser usada.</p>}
      </div>
      {!readOnly && (
        <>
          <CheckField label="Treinada" checked={st.trained} onChange={trained => set({ trained })} />
          <AttributePicker label={`Atributo (padrão ${attrAbbr(def.attribute)})`} value={st.attribute} onChange={attribute => set({ attribute })} />
          <StepRow label="Outros" hint="itens, poderes, condições…" value={st.other ?? 0} readOnly={readOnly} onChange={other => set({ other })} />
          {def.hasSpecialty && (
            <TextField label="Especialidade" value={st.specialty} placeholder="Ex: Ferreiro" maxLength={50} onChange={specialty => set({ specialty })} />
          )}
        </>
      )}
    </div>
  );
}

function CastAttrBody() {
  const { sheet, update, closePanel, d } = useT20();
  return (
    <div className="flex flex-col gap-2">
      {T20_ATTRIBUTES.map(a => {
        const on = d.castAttr === a.key;
        const dc = 10 + d.half + (sheet.attributes?.[a.key] ?? 0);
        return (
          <button key={a.key} type="button" aria-pressed={on}
            onClick={() => { update({ spellcasting: { ...sheet.spellcasting, attribute: a.key } }); closePanel(); }}
            className={cn('flex min-h-[52px] items-center gap-2 rounded-lg border px-3.5 text-left text-base transition-colors',
              on ? 'border-primary bg-primary/15 text-primary-text' : 'border-hairline')}>
            <span>{a.name}</span>
            <span className="text-muted-foreground">({formatBonus(sheet.attributes?.[a.key] ?? 0)})</span>
            <span className="ml-auto text-sm text-muted-foreground">CD {dc}</span>
          </button>
        );
      })}
    </div>
  );
}

function titleOf(p: T20Panel): string {
  switch (p.kind) {
    case 'attribute': return attrName(p.key);
    case 'defense': return 'Defesa';
    case 'info': return 'Deslocamento e tamanho';
    case 'skill': return T20_SKILLS.find(s => s.key === p.key)?.name ?? 'Perícia';
    case 'castAttr': return 'Atributo-chave das magias';
  }
}

/** Renderiza o painel pedido por `openPanel`. Coloque uma vez por layout. */
export function T20Panels() {
  const { panel, closePanel, readOnly } = useT20();
  // No somente leitura não abrimos painéis só de edição.
  const p = panel && readOnly && (panel.kind === 'info' || panel.kind === 'castAttr') ? null : panel;
  const skill = p?.kind === 'skill' ? T20_SKILLS.find(s => s.key === p.key) : undefined;
  return (
    <Panel open={!!p} onOpenChange={open => { if (!open) closePanel(); }} title={p ? titleOf(p) : ''}>
      {p?.kind === 'attribute' && <AttributeBody k={p.key} />}
      {p?.kind === 'defense' && <DefenseBody />}
      {p?.kind === 'info' && <InfoBody />}
      {skill && <SkillBody def={skill} />}
      {p?.kind === 'castAttr' && <CastAttrBody />}
    </Panel>
  );
}
