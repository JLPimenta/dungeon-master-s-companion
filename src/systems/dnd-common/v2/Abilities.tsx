import type { AbilityKey } from '@/types/character';
import { cn } from '@/lib/utils';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { ABILITY_ABBR, ABILITY_KEYS, ABILITY_LABELS, fmt, useDndSheet } from './context';
import { BonusMark } from './Vitals';

/** Losango de proficiência: 0 = vazio, 1 = proficiente, 2 = especialista. */
export function ProfMarks({ level, className }: { level: 0 | 1 | 2; className?: string }) {
  const mark = (on: boolean, key: number) => (
    <span
      key={key}
      className={cn('inline-block h-2 w-2 rotate-45', on ? 'bg-primary' : 'border border-muted-foreground/50')}
    />
  );
  return (
    <span className={cn('flex items-center gap-1', className)} aria-label={['sem proficiência', 'proficiente', 'especialista'][level]}>
      {mark(level >= 1, 1)}
      {level === 2 && mark(true, 2)}
    </span>
  );
}

/** Grade de atributos (3 × 2 no celular, 2 colunas no tablet). Toque abre o painel do atributo. */
export function AbilityGrid({ columns = 3, title = 'Atributos', bare }: { columns?: 2 | 3; title?: string; bare?: boolean }) {
  const { sheet, d, openPanel } = useDndSheet();
  return (
    <SheetCard title={title} bare={bare} id="atributos">
      <div className={cn('grid gap-2', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
        {ABILITY_KEYS.map(k => (
          <button
            key={k}
            type="button"
            onClick={() => openPanel({ kind: 'ability', key: k })}
            aria-label={`${ABILITY_LABELS[k]}: valor ${sheet.abilities[k].value}, modificador ${fmt(d.mod(k))}`}
            className="flex flex-col items-center rounded-lg border border-hairline bg-background/40 px-1 py-2 transition-colors hover:border-primary/50"
          >
            <span className="font-heading text-[13px] font-bold tracking-[0.08em] text-muted-foreground">
              {ABILITY_ABBR[k]} <span className="text-foreground">{sheet.abilities[k].value}</span>
            </span>
            <span className="font-heading text-[26px] font-bold leading-tight text-primary-text">{fmt(d.mod(k))}</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {sheet.abilities[k].proficient && <ProfMarks level={1} />}
              salv. {fmt(d.save(k))}
              <BonusMark show={d.saveBonus(k) !== 0} />
            </span>
          </button>
        ))}
      </div>
    </SheetCard>
  );
}

/** Atributos em linhas (computador): modificador grande, nome, valor, salvaguarda. */
export function AbilityRows() {
  const { sheet, d, openPanel } = useDndSheet();
  return (
    <SheetCard title="Atributos" id="atributos">
      <div className="flex flex-col gap-1.5">
        {ABILITY_KEYS.map(k => (
          <button
            key={k}
            type="button"
            onClick={() => openPanel({ kind: 'ability', key: k })}
            className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-lg border border-hairline bg-background/40 px-3 py-2 text-left transition-colors hover:border-primary/50"
          >
            <span className="font-heading text-[24px] font-bold text-primary-text">{fmt(d.mod(k))}</span>
            <span className="flex flex-col">
              <span className="font-heading text-[14px] font-bold">{ABILITY_LABELS[k]}</span>
              <span className="text-sm text-muted-foreground">valor {sheet.abilities[k].value}</span>
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {sheet.abilities[k].proficient && <ProfMarks level={1} />}
              salv. {fmt(d.save(k))}
              <BonusMark show={d.saveBonus(k) !== 0} />
            </span>
          </button>
        ))}
      </div>
    </SheetCard>
  );
}

function skillLevel(s: { proficient: boolean; expertise: boolean }): 0 | 1 | 2 {
  return s.expertise ? 2 : s.proficient ? 1 : 0;
}

export function SkillsLegend() {
  const { d } = useDndSheet();
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rotate-45 bg-primary" />proficiente</span>
      <span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rotate-45 bg-hp-temp-foreground" />com bônus</span>
      <span className="ml-auto">Percepção passiva <strong className="font-heading text-foreground">{d.passive}</strong></span>
    </div>
  );
}

/** Um cartão por atributo: cabeçalho, salvaguarda e as perícias dele. */
export function SkillsByAbility({ className }: { className?: string }) {
  const { sheet, d, openPanel } = useDndSheet();
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {ABILITY_KEYS.map((k: AbilityKey) => {
        const skills = sheet.skills.filter(s => s.ability === k);
        return (
          <section key={k} className="rounded-xl border border-hairline bg-card p-1.5">
            <button
              type="button"
              onClick={() => openPanel({ kind: 'ability', key: k })}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-primary/5"
            >
              <span className="font-heading text-[14px] font-bold uppercase tracking-[0.08em] text-primary-text">{ABILITY_LABELS[k]}</span>
              <span className="text-sm text-muted-foreground">valor {sheet.abilities[k].value}</span>
              <span className="ml-auto font-heading text-[20px] font-bold">{fmt(d.mod(k))}</span>
            </button>
            <SkillRow
              label="Salvaguarda"
              level={sheet.abilities[k].proficient ? 1 : 0}
              total={d.save(k)}
              bonus={d.saveBonus(k) !== 0}
              onClick={() => openPanel({ kind: 'ability', key: k })}
              emphasis
            />
            {skills.map(s => (
              <SkillRow
                key={s.name}
                label={s.name}
                level={skillLevel(s)}
                total={d.skill(s.name)}
                bonus={d.skillBonus(s.name) !== 0}
                onClick={() => openPanel({ kind: 'skill', name: s.name })}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function SkillRow({ label, level, total, bonus, onClick, emphasis, abbr }: {
  label: string;
  level: 0 | 1 | 2;
  total: number;
  bonus: boolean;
  onClick: () => void;
  emphasis?: boolean;
  abbr?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-primary/5"
    >
      <ProfMarks level={level} className="w-5" />
      <span className={cn('text-base', emphasis && 'italic text-muted-foreground')}>{label}</span>
      {abbr && <span className="text-sm text-muted-foreground">{abbr}</span>}
      <BonusMark show={bonus} />
      <span className="ml-auto font-heading text-[17px] font-bold">{fmt(total)}</span>
    </button>
  );
}

/** Perícias em lista única (computador). */
export function SkillsFlat() {
  const { sheet, d, openPanel } = useDndSheet();
  return (
    <SheetCard title="Perícias" meta={`Passiva ${d.passive}`}>
      <div className="flex flex-col">
        {sheet.skills.map(s => (
          <SkillRow
            key={s.name}
            label={s.name}
            abbr={ABILITY_ABBR[s.ability]}
            level={skillLevel(s)}
            total={d.skill(s.name)}
            bonus={d.skillBonus(s.name) !== 0}
            onClick={() => openPanel({ kind: 'skill', name: s.name })}
          />
        ))}
      </div>
    </SheetCard>
  );
}
