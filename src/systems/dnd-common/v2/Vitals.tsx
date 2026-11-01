import { Minus, Pencil, Plus, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberField } from '@/systems/shared/ui/NumberField';
import { fmt, useDndSheet } from './context';

/*
 * Pontos de vida, temporários, barra e números de combate
 * (docs/redesign-v2/03-ficha.md, "Pontos de vida" e "Números de combate").
 */

/** Marca de "inclui bônus adicional" (losango azul). */
export function BonusMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      title="Inclui bônus adicional"
      aria-label="inclui bônus adicional"
      className="ml-1 inline-block h-[7px] w-[7px] rotate-45 bg-hp-temp-foreground align-middle"
    />
  );
}

/** Barra de vida: vermelho = atuais, azul = temporários; escala = max(máximo, atuais + temporários). */
export function HpBar({ className }: { className?: string }) {
  const { sheet } = useDndSheet();
  const { current, max, temp } = sheet.hitPoints;
  const total = Math.max(max, current + temp) || 1;
  return (
    <div
      role="meter"
      aria-label="Pontos de vida"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      className={cn('flex h-2.5 w-full overflow-hidden rounded-full bg-foreground/10', className)}
    >
      <div className="h-full bg-hp transition-[width] duration-200" style={{ width: `${(current / total) * 100}%` }} />
      <div className="h-full bg-hp-temp transition-[width] duration-200" style={{ width: `${(temp / total) * 100}%` }} />
    </div>
  );
}

/** Campos de PV (atual / máximo) e temporários. `size`: tamanho do número atual. */
export function HpFields({ size = 'lg' }: { size?: 'lg' | 'md' | 'sm' }) {
  const { sheet, update, readOnly } = useDndSheet();
  const hp = sheet.hitPoints;
  const setHp = (patch: Partial<typeof hp>) => update({ hitPoints: { ...hp, ...patch } });
  const big = size === 'lg' ? 'text-[40px] w-[3.2ch]' : size === 'md' ? 'text-[28px] w-[3.2ch]' : 'text-[20px] w-[3ch]';
  const field = 'rounded-md font-heading font-bold leading-none focus:bg-background focus:ring-1 focus:ring-primary disabled:opacity-100';

  return (
    <div className="flex items-end gap-3">
      <div className="flex items-baseline gap-1">
        <NumberField
          aria-label="Pontos de vida atuais"
          value={hp.current}
          onChange={v => setHp({ current: v })}
          min={0}
          max={hp.max}
          disabled={readOnly}
          className={cn(field, big, 'text-foreground')}
        />
        <span className="text-muted-foreground">/</span>
        <NumberField
          aria-label="Pontos de vida máximos"
          value={hp.max}
          // Não puxa o PV atual para baixo: enquanto digita "120", o máximo passa por "1" e "12".
          onChange={v => setHp({ max: v })}
          min={1}
          disabled={readOnly}
          className={cn(field, size === 'sm' ? 'w-[3ch] text-base' : 'w-[3ch] text-xl', 'text-muted-foreground')}
        />
      </div>
      <label className="ml-auto flex flex-col items-end gap-0.5">
        <span className="text-sm italic text-muted-foreground">Temporários</span>
        <NumberField
          aria-label="Pontos de vida temporários"
          value={hp.temp}
          onChange={v => setHp({ temp: v })}
          min={0}
          disabled={readOnly}
          className={cn(
            field,
            'h-10 w-16 rounded-md border border-hp-temp/50 text-xl text-hp-temp-foreground',
          )}
        />
      </label>
    </div>
  );
}

function StatButton({ value, label, onClick, bonus, icon }: {
  value: string;
  label: string;
  onClick: () => void;
  bonus?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[64px] flex-col items-center justify-center rounded-lg border border-hairline bg-background/40 px-1 py-1.5 transition-colors hover:border-primary/50"
    >
      <span className="flex items-center gap-1 font-heading text-[22px] font-bold leading-tight">
        {icon}
        {value}
        <BonusMark show={!!bonus} />
      </span>
      <span className="text-sm italic text-muted-foreground">{label}</span>
    </button>
  );
}

/** CA, Iniciativa, Deslocamento, Proficiência. */
export function CombatNumbers({ className }: { className?: string }) {
  const { sheet, d, openPanel } = useDndSheet();
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      <StatButton
        value={String(sheet.armorClass)}
        label="CA"
        icon={<Shield className="h-4 w-4 text-primary-text" />}
        onClick={() => openPanel({ kind: 'info' })}
      />
      <StatButton
        value={fmt(d.initiative)}
        label="Iniciativa"
        bonus={(sheet.bonuses?.initiative ?? 0) !== 0}
        onClick={() => openPanel({ kind: 'initiative' })}
      />
      <StatButton value={`${sheet.speed} m`} label="Deslocamento" onClick={() => openPanel({ kind: 'info' })} />
      <StatButton
        value={fmt(d.prof)}
        label="Proficiência"
        bonus={(sheet.bonuses?.proficiencyBonus ?? 0) !== 0}
        onClick={() => openPanel({ kind: 'proficiency' })}
      />
    </div>
  );
}

const roundBtn =
  'flex h-10 w-10 items-center justify-center rounded-md border border-border/60 transition-colors hover:bg-primary/10 active:scale-95 disabled:opacity-40 disabled:pointer-events-none';

/** Dados de vida com − (gastar) e + (recuperar). */
export function HitDiceRow() {
  const { sheet, update, d, readOnly } = useDndSheet();
  const used = sheet.hitDice?.used ?? 0;
  const setUsed = (v: number) => update({ hitDice: { ...sheet.hitDice, used: v } });
  return (
    <div className="flex min-h-[48px] flex-wrap items-center gap-x-2 gap-y-1">
      <span className="whitespace-nowrap text-[15px] italic text-muted-foreground">Dados de vida</span>
      <div className="ml-auto flex items-center gap-2">
        {!readOnly && (
          <button type="button" className={roundBtn} aria-label="Gastar um dado de vida"
            disabled={used >= d.hitDiceTotal} onClick={() => setUsed(Math.min(d.hitDiceTotal, used + 1))}>
            <Minus className="h-4 w-4" />
          </button>
        )}
        <span className="min-w-[72px] text-center font-heading text-lg font-bold" aria-live="polite">
          {d.hitDiceRemaining} <span className="text-muted-foreground">/ {sheet.hitDice?.total || '—'}</span>
        </span>
        {!readOnly && (
          <button type="button" className={roundBtn} aria-label="Recuperar um dado de vida"
            disabled={used <= 0} onClick={() => setUsed(Math.max(0, used - 1))}>
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Tamanho, link "editar" e Inspiração (rótulo da edição: "Inspiração Heroica" no 5.5e, "Inspiração" na 5e). */
export function SizeAndInspiration() {
  const { sheet, update, readOnly, openPanel, rules } = useDndSheet();
  const inspirationLabel = rules.inspirationLabel;
  const on = !!sheet.heroicInspiration;
  return (
    <div className="flex min-h-[48px] flex-wrap items-center gap-2">
      <span className="text-[15px] italic text-muted-foreground">Tamanho</span>
      <span className="text-base">{sheet.size || '—'}</span>
      {!readOnly && (
        <button type="button" onClick={() => openPanel({ kind: 'info' })}
          aria-label="Editar CA, deslocamento, tamanho e dados de vida"
          className="flex h-10 items-center gap-1 rounded-md px-2 text-[15px] text-muted-foreground hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />
          editar
        </button>
      )}
      <button
        type="button"
        aria-pressed={on}
        disabled={readOnly}
        onClick={() => update({ heroicInspiration: !on })}
        className={cn(
          'ml-auto flex h-10 items-center gap-1.5 rounded-full border px-4 text-[15px] transition-colors disabled:cursor-default',
          on ? 'border-primary bg-primary/15 text-primary-text' : 'border-hairline text-muted-foreground',
        )}
      >
        <Star className={cn('h-4 w-4', on && 'fill-current')} />
        {inspirationLabel}
      </button>
    </div>
  );
}

/** Salvaguardas contra morte: com PV 0 ou quando já há marcação (regra do redesign). */
export function DeathSaves() {
  const { sheet, update, readOnly } = useDndSheet();
  const ds = sheet.deathSaves ?? { successes: 0, failures: 0 };
  if (sheet.hitPoints.current > 0 && ds.successes === 0 && ds.failures === 0) return null;

  const set = (type: 'successes' | 'failures', val: number) =>
    update({ deathSaves: { ...ds, [type]: Math.min(3, Math.max(0, val)) } });

  const row = (type: 'successes' | 'failures', label: string, color: string) => (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[15px] italic text-muted-foreground">{label}</span>
      {[0, 1, 2].map(i => {
        const marked = ds[type] > i;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            aria-label={`${label}: marca ${i + 1}`}
            aria-pressed={marked}
            onClick={() => set(type, marked ? i : i + 1)}
            className="flex h-10 w-10 items-center justify-center disabled:cursor-default"
          >
            <span className={cn('h-5 w-5 rounded-full border-[1.5px]', marked ? color : 'border-muted-foreground/50')} />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-lg border border-hp/40 bg-hp/5 p-3">
      <div className="mb-1 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-hp">Salvaguardas contra morte</div>
      {row('successes', 'Sucesso', 'border-green-500 bg-green-500')}
      {row('failures', 'Falha', 'border-hp bg-hp')}
    </div>
  );
}

/** Cartão completo de vitais (aba Combate no celular, Informações gerais no computador). */
export function VitalsCard({ title = 'Pontos de vida', className }: { title?: string; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-3 rounded-xl border border-hairline bg-card p-3.5', className)}>
      <span className="text-sm italic text-muted-foreground">{title}</span>
      <HpFields />
      <HpBar />
      <CombatNumbers />
      <HitDiceRow />
      <SizeAndInspiration />
      <DeathSaves />
    </section>
  );
}
