import type { CharacterSheet, AbilityKey } from '@/types/character';
import { ABILITY_ABBR } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { BonusInput } from '@/components/ui/bonus-input';
import {
  getSkillBonus,
  getEffectiveProficiencyBonus,
  getPassivePerception,
  formatModifier,
} from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

const ABILITY_ORDER: AbilityKey[] = [
  'strength', 'dexterity', 'constitution',
  'intelligence', 'wisdom', 'charisma',
];

export function SkillsSection({ sheet, onChange }: Props) {
  const profBonus = getEffectiveProficiencyBonus(sheet);

  const perceptionSkill = sheet.skills.find(s => s.name === 'Percepção');
  const perceptionBonus = sheet.bonuses?.skills?.['Percepção'] ?? 0;
  const passivePerc = getPassivePerception(
      sheet.abilities.wisdom.value,
      perceptionSkill?.proficient ?? false,
      profBonus,
      perceptionBonus,
  );

  const toggleProficiency = (idx: number) => {
    const skills = [...sheet.skills];
    skills[idx] = { ...skills[idx], proficient: !skills[idx].proficient };
    onChange({ skills });
  };

  const toggleExpertise = (idx: number) => {
    const skills = [...sheet.skills];
    skills[idx] = { ...skills[idx], expertise: !skills[idx].expertise };
    onChange({ skills });
  };

  const handleSkillBonus = (skillName: string, value: number) => {
    onChange({
      bonuses: {
        ...sheet.bonuses,
        skills: { ...(sheet.bonuses?.skills ?? {}), [skillName]: value },
      },
    });
  };

  const groups = ABILITY_ORDER.map(key => ({
    key,
    abbr: ABILITY_ABBR[key],
    skills: sheet.skills.filter(s => s.ability === key),
  })).filter(g => g.skills.length > 0);

  return (
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
          <CardTitle className="text-lg text-primary">Perícias</CardTitle>
          <span className="text-xs text-muted-foreground">Percepção Passiva: {passivePerc}</span>
        </CardHeader>

        <CardContent className="px-4 pb-4 text-sm">
          {groups.map((group, gi) => (
              <div
                  key={group.key}
                  className={gi > 0 ? 'pt-2 mt-2 border-t border-muted-foreground/10' : 'pt-0'}
              >
                {/* Label do atributo */}
                <span className="mb-1 block font-mono text-sm text-muted-foreground">
              {group.abbr}
            </span>

                <div className="space-y-1">
                  {group.skills.map(skill => {
                    const globalIdx = sheet.skills.findIndex(
                        s => s.name === skill.name && s.ability === skill.ability,
                    );
                    const extraBonus = sheet.bonuses?.skills?.[skill.name] ?? 0;
                    const bonus = getSkillBonus(
                        sheet.abilities[skill.ability].value,
                        skill.proficient,
                        skill.expertise,
                        profBonus,
                        extraBonus,
                    );

                    return (
                        <div key={skill.name} className="flex items-center gap-1.5">
                          {/* Proficiência */}
                          <Checkbox
                              checked={skill.proficient}
                              onCheckedChange={() => toggleProficiency(globalIdx)}
                              className="h-4 w-4"
                              title="Proficiente"
                          />
                          {/* Expertise */}
                          <Checkbox
                              checked={skill.expertise}
                              onCheckedChange={() => toggleExpertise(globalIdx)}
                              className="h-4 w-4"
                              title="Expertise"
                          />

                          {/* Bônus total calculado (já inclui o bônus manual) */}
                          <span className="w-8 text-right font-mono text-sm font-bold text-primary">
                      {formatModifier(bonus)}
                    </span>

                          {/* Bônus manual de item ou antecedente */}
                          <BonusInput
                              value={extraBonus}
                              onChange={v => handleSkillBonus(skill.name, v)}
                              title={`Bônus extra em ${skill.name} (item, antecedente…)`}
                              widthClass="w-9"
                              heightClass="h-7"
                              textClass="text-xs"
                          />

                          {/* Nome da perícia */}
                          <span className="text-sm text-foreground">{skill.name}</span>
                        </div>
                    );
                  })}
                </div>
              </div>
          ))}
        </CardContent>
      </Card>
  );
}