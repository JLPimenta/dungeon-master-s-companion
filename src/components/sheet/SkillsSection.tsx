import type { CharacterSheet, Skill } from '@/types/character';
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
        <CardTitle className="text-sm text-primary">Perícias</CardTitle>
        <span className="text-xs text-muted-foreground">Passiva: {passivePerc}</span>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-4">
        {sheet.skills.map((skill, i) => {
          const bonus = getSkillBonus(
            sheet.abilities[skill.ability].value,
            skill.proficient,
            skill.expertise,
            profBonus
          );
          return (
            <div key={skill.name} className="flex items-center gap-1.5 text-xs">
              <Checkbox
                checked={skill.proficient}
                onCheckedChange={() => toggleProficiency(i)}
                className="h-3.5 w-3.5"
              />
              <Checkbox
                checked={skill.expertise}
                onCheckedChange={() => toggleExpertise(i)}
                className="h-3.5 w-3.5"
                title="Expertise"
              />
              <span className="w-7 text-right font-mono font-bold text-primary">
                {formatModifier(bonus)}
              </span>
              <span className="text-foreground">{skill.name}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
