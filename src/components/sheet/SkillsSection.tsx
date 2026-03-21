import type { CharacterSheet, AbilityKey } from '@/types/character';
import { ABILITY_ABBR } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getSkillBonus, getProficiencyBonus, formatModifier, getPassivePerception } from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function SkillsSection({ sheet, onChange }: Props) {
  const profBonus = getProficiencyBonus(sheet.level);
  const perception = sheet.skills.find(s => s.name === 'Percepção');
  const passivePerc = getPassivePerception(
    sheet.abilities.wisdom.value,
    perception?.proficient ?? false,
    profBonus
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

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-lg text-primary">Perícias</CardTitle>
        <span className="text-sm md:text-xs text-muted-foreground">Percepção Passiva: {passivePerc}</span>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-4 text-sm md:text-xs">
        {(() => {
          const abilityOrder: AbilityKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
          const groups = abilityOrder.map(key => ({
            key,
            abbr: ABILITY_ABBR[key],
            skills: sheet.skills.filter(s => s.ability === key),
          }));

          return groups.map((group, gi) => {
            if (group.skills.length === 0) return null;
            return (
              <div key={group.key} className={"pt-2" + (gi > 0 ? ' border-t border-muted-foreground/10' : '')}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm md:text-xs font-mono text-muted-foreground w-10">{group.abbr}</span>
                </div>
                <div className="space-y-1">
                  {group.skills.map((skill) => {
                    const bonus = getSkillBonus(
                      sheet.abilities[skill.ability].value,
                      skill.proficient,
                      skill.expertise,
                      profBonus
                    );
                    const globalIndex = sheet.skills.findIndex(s => s.name === skill.name && s.ability === skill.ability);
                    return (
                      <div key={skill.name} className="flex items-center gap-2 text-lg md:text-sm">
                        <Checkbox
                          checked={skill.proficient}
                          onCheckedChange={() => toggleProficiency(globalIndex)}
                          className="h-4 w-4"
                        />
                        <Checkbox
                          checked={skill.expertise}
                          onCheckedChange={() => toggleExpertise(globalIndex)}
                          className="h-4 w-4"
                          title="Expertise"
                        />
                        <span className="w-7 text-right font-mono font-bold text-primary">
                          {formatModifier(bonus)}
                        </span>
                        <span className="text-foreground">{skill.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
      </CardContent>
    </Card>
  );
}
