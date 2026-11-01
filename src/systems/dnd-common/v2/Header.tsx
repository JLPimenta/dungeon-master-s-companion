import { Pencil, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberField } from '@/systems/shared/ui/NumberField';
import { EditToggle, useEditing } from '@/systems/shared/ui/ViewEditBlock';
import { IdentityGrid, type IdentityField } from '@/systems/shared/ui/IdentityGrid';
import { fmt, useDndSheet } from './context';
import { BonusMark, CombatNumbers, DeathSaves, HitDiceRow, HpBar, HpFields, SizeAndInspiration } from './Vitals';
import { AbilityGrid } from './Abilities';

/*
 * Peças da família D&D usadas pelas cascas (barra superior, faixa compacta,
 * cabeçalho do computador). Valem para 5.5e e 5e.
 */

/** "Bruxo 12 · Grande Antigo" (ou "Guerreiro 5 · Anão" na 5e). */
export function useClassSubtitle(extraKey?: string): string {
  const { sheet } = useDndSheet();
  const s = sheet as unknown as Record<string, unknown>;
  const cls = [typeof s.class === 'string' ? s.class.trim() : '', sheet.level].filter(Boolean).join(' ');
  const extra = extraKey && typeof s[extraKey] === 'string' ? (s[extraKey] as string).trim() : '';
  return [cls, extra].filter(Boolean).join(' · ');
}

/** Valores e alteração da ficha para a grade de identidade. */
export function useDndIdentity() {
  const { sheet, update } = useDndSheet();
  return {
    values: sheet as unknown as Record<string, unknown>,
    onChange: (key: string, value: string | number) => update({ [key]: value } as never),
  };
}

/** PV atual editável + "/ máximo" + "+temporários" (barra superior e faixa compacta). */
export function InlineHp({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useDndSheet();
  const hp = sheet.hitPoints;
  return (
    <div className={cn('flex items-baseline gap-1', className)}>
      <span className="text-sm italic text-muted-foreground">PV</span>
      <NumberField
        aria-label="Pontos de vida atuais"
        value={hp.current}
        min={0}
        max={hp.max}
        disabled={readOnly}
        onChange={v => update({ hitPoints: { ...hp, current: v } })}
        className="w-[3ch] rounded font-heading text-xl font-bold focus:bg-background focus:ring-1 focus:ring-primary disabled:opacity-100"
      />
      <span className="text-sm text-muted-foreground">/ {hp.max}</span>
      {hp.temp > 0 && <span className="font-heading text-sm font-bold text-hp-temp-foreground">+{hp.temp}</span>}
    </div>
  );
}

/** CA compacta (barra superior do computador e faixa do celular). */
export function InlineAc() {
  const { sheet } = useDndSheet();
  return (
    <span className="flex shrink-0 items-center gap-1">
      <Shield className="h-4 w-4 text-primary-text" />
      <span className="text-sm italic text-muted-foreground">CA</span>
      <strong className="font-heading text-lg">{sheet.armorClass}</strong>
    </span>
  );
}

/** Faixa sob a barra superior do celular, fora da aba Combate: PV, CA, CD. */
export function CompactVitals() {
  const { d } = useDndSheet();
  return (
    <div className="shrink-0 border-b border-border/40 bg-surface px-3 pb-2 pt-1">
      <div className="flex items-center gap-4">
        <InlineHp />
        <span className="ml-auto"><InlineAc /></span>
        <span className="flex items-center gap-1 text-base">
          <span className="text-sm italic text-muted-foreground">CD</span>
          <strong className="font-heading">{d.spellDC ?? '—'}</strong>
        </span>
      </div>
      <HpBar className="mt-1.5 h-1.5" />
    </div>
  );
}

/** Cabeçalho da ficha no computador: identidade (leitura/edição) e Proficiência. */
export function DndHeaderCard({ fields, columns = 8 }: { fields: IdentityField[]; columns?: 8 | 9 }) {
  const { readOnly, d, openPanel, sheet } = useDndSheet();
  const identity = useDndIdentity();
  const { isEditing, start, done } = useEditing('identity');
  const editing = isEditing && !readOnly;
  return (
    <section id="topo" className="flex scroll-mt-24 items-start gap-4 rounded-xl border border-hairline bg-card p-4">
      <div className="min-w-0 flex-1">
        <IdentityGrid fields={fields} values={identity.values} onChange={identity.onChange} columns={columns} editing={editing} />
      </div>
      <button
        type="button"
        onClick={() => openPanel({ kind: 'proficiency' })}
        className="flex min-h-[64px] w-[110px] shrink-0 flex-col items-center justify-center rounded-lg border border-primary/40 bg-primary/5 hover:bg-primary/10"
      >
        <span className="flex items-center font-heading text-[24px] font-bold text-primary-text">
          {fmt(d.prof)}
          <BonusMark show={(sheet.bonuses?.proficiencyBonus ?? 0) !== 0} />
        </span>
        <span className="text-sm italic text-muted-foreground">Proficiência</span>
      </button>
      {!readOnly && (
        <div className="shrink-0 pt-1">
          <EditToggle isEditing={editing} onStart={start} onDone={done} label="dados do personagem" />
        </div>
      )}
    </section>
  );
}

/** Vitais no cabeçalho do tablet: PV, temporários, barra, CA/Iniciativa/Deslocamento/Proficiência. */
export function DndTabletHeader() {
  const { readOnly, openPanel } = useDndSheet();
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div className="flex w-[260px] shrink-0 flex-col gap-1.5">
        <HpFields size="md" />
        <HpBar className="h-2" />
      </div>
      <CombatNumbers className="max-w-[440px] flex-1" />
      {!readOnly && (
        <button type="button" onClick={() => openPanel({ kind: 'info' })}
          aria-label="Editar CA, deslocamento, tamanho e dados de vida"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 hover:bg-primary/10">
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Coluna de atributos do tablet: grade 2×3, tamanho/inspiração, dados de vida, salvaguardas contra morte. */
export function DndTabletAbilityColumn() {
  return (
    <>
      <AbilityGrid columns={2} />
      <section className="flex flex-col gap-1 rounded-xl border border-hairline bg-card p-3.5">
        <SizeAndInspiration />
        <HitDiceRow />
      </section>
      <DeathSaves />
    </>
  );
}
