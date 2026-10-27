import { Checkbox } from '@/components/ui/checkbox';
import { SheetSection } from '@/systems/shared/SheetSection';
import { BonusInput } from '@/components/ui/bonus-input';
import { cn } from '@/lib/utils';
import { AttributeSelect, type T20SectionProps } from './common';
import { skillState, T20_SKILLS, type T20SkillDefinition } from '../skills';
import { armorPenaltyTotal, formatBonus, halfLevel, skillTotal, trainingBonus } from '../rules';
import type { T20SkillState } from '../types';

export function T20Skills({ sheet, onChange, onBlur }: T20SectionProps) {
  const penalty = armorPenaltyTotal(sheet);

  const update = (def: T20SkillDefinition, patch: Partial<T20SkillState>) =>
    onChange({
      skills: { ...sheet.skills, [def.key]: { ...skillState(sheet.skills, def), ...patch } },
    });

  return (
    <SheetSection
      title="Perícias"
      onBlur={onBlur}
      aside={
        <span className="text-xs text-muted-foreground">
          ½ nível {formatBonus(halfLevel(sheet.level))} · treino {formatBonus(trainingBonus(sheet.level))}
        </span>
      }
    >
      <ul className="space-y-0.5 text-sm">
        {T20_SKILLS.map(def => {
          const state = skillState(sheet.skills, def);
          const total = skillTotal(sheet, def);
          const id = `t20-skill-${def.key}`;

          return (
            <li key={def.key} className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-primary/5">
              <Checkbox
                id={id}
                checked={state.trained}
                onCheckedChange={v => update(def, { trained: v === true })}
                aria-label={`Treinado em ${def.name}`}
              />

              <div className="flex min-w-0 flex-1 items-center gap-1">
                <label htmlFor={id} className={cn('truncate', state.trained ? 'text-foreground' : 'text-muted-foreground')}>
                  {def.name}
                  {def.trainedOnly && <sup className="ml-0.5 text-primary/70" title="Somente treinada">®</sup>}
                  {def.armorPenalty && <sup className="ml-0.5 text-primary/70" title="Sofre penalidade de armadura">✝</sup>}
                </label>
                {def.hasSpecialty && (
                  <input
                    aria-label="Especialidade do Ofício"
                    placeholder="qual?"
                    maxLength={60}
                    value={state.specialty ?? ''}
                    onChange={e => update(def, { specialty: e.target.value })}
                    className="h-6 min-w-0 flex-1 border-b border-dashed border-primary/30 bg-transparent px-1 text-xs focus:border-primary focus:outline-none"
                  />
                )}
              </div>

              <AttributeSelect
                label={`Atributo de ${def.name}`}
                value={state.attribute}
                onChange={attribute => update(def, { attribute })}
                className={cn('h-7 w-11 cursor-pointer', state.attribute !== def.attribute && 'border-primary/60 text-primary')}
              />
              <BonusInput
                value={state.other ?? 0}
                onChange={other => update(def, { other })}
                title={`Outros bônus em ${def.name} (itens, poderes, condições)`}
                heightClass="h-7"
                widthClass="w-9"
                textClass="text-xs"
              />
              <span
                className={cn(
                  'w-9 shrink-0 text-right font-mono text-sm font-bold',
                  total === null ? 'text-muted-foreground/50' : 'text-primary',
                )}
                title={total === null ? 'Somente treinada: não pode ser usada sem treino' : undefined}
              >
                {total === null ? 'ND' : formatBonus(total)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 border-t border-border/40 pt-2 text-xs text-muted-foreground">
        ® somente treinada · ✝ penalidade de armadura{penalty > 0 ? ` (−${penalty} aplicada)` : ''}
      </p>
    </SheetSection>
  );
}
