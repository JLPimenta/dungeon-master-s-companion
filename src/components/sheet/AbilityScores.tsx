import type { CharacterSheet, AbilityKey } from '@/types/character';
import { ABILITY_ABBR } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { getModifier, formatModifier, getSkillBonus, getProficiencyBonus } from '@/utils/calculations';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {HelpCircle} from "lucide-react";

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

const ABILITY_KEYS: AbilityKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

export function AbilityScores({ sheet, onChange }: Props) {
  const handleValue = (key: AbilityKey, value: number) => {
    onChange({
      abilities: { ...sheet.abilities, [key]: { ...sheet.abilities[key], value } },
    });
  };

  const handleProficient = (key: AbilityKey, proficient: boolean) => {
    onChange({
      abilities: { ...sheet.abilities, [key]: { ...sheet.abilities[key], proficient } },
    });
  };

  const profBonus = getProficiencyBonus(sheet.level);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-lg text-primary align-items center flex gap-1 ">
              <span>Atributos</span>
              <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild className="flex items-center gap-1 text-sm text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>
                          Salvaguarda = Modificador de Atributo + Bônus de Proficiência
                      </p>
                  </TooltipContent>
              </Tooltip>
          </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {ABILITY_KEYS.map(key => {
          const mod = getModifier(sheet.abilities[key].value);
          const saveBonus = getSkillBonus(
            sheet.abilities[key].value,
            sheet.abilities[key].proficient,
            false,
            profBonus
          );
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-12 text-sm font-semibold text-muted-foreground">{ABILITY_ABBR[key]}</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={sheet.abilities[key].value}
                onChange={e => handleValue(key, Number(e.target.value) || 10)}
                className="h-10 w-16 text-center"
              />
              <span className="w-10 text-center text-sm font-bold text-primary">
                {formatModifier(mod)}
              </span>
              <Checkbox
                checked={sheet.abilities[key].proficient}
                onCheckedChange={(c) => handleProficient(key, !!c)}
                title="Salvaguarda"
                className="h-5 w-5"
              />
                <span className="text-sm text-muted-foreground">Salv.</span>
                <span className="w-10 text-center text-sm font-bold text-primary">({formatModifier(saveBonus)})</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
