import type {AbilityKey, CharacterSheet} from '@/types/character';
import {ABILITY_ABBR} from '@/types/character';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {NumericInput} from '@/components/ui/numeric-input';
import {Checkbox} from '@/components/ui/checkbox';
import {BonusInput} from '@/components/ui/bonus-input';
import {formatModifier, getEffectiveProficiencyBonus, getModifier, getSavingThrowBonus,} from '@/utils/calculations';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import {HelpCircle} from 'lucide-react';

interface Props {
    sheet: CharacterSheet;
    onChange: (patch: Partial<CharacterSheet>) => void;
    onBlur?: () => void;
}

const ABILITY_KEYS: AbilityKey[] = [
    'strength', 'dexterity', 'constitution',
    'intelligence', 'wisdom', 'charisma',
];

export function AbilityScores({sheet, onChange, onBlur}: Props) {
    const profBonus = getEffectiveProficiencyBonus(sheet);

    const handleValue = (key: AbilityKey, value: number) => {
        onChange({
            abilities: {...sheet.abilities, [key]: {...sheet.abilities[key], value}},
        });
    };

    const handleProficient = (key: AbilityKey, proficient: boolean) => {
        onChange({
            abilities: {...sheet.abilities, [key]: {...sheet.abilities[key], proficient}},
        });
    };

    const handleSavingThrowBonus = (key: AbilityKey, value: number) => {
        onChange({
            bonuses: {
                ...sheet.bonuses,
                savingThrows: {...(sheet.bonuses?.savingThrows ?? {}), [key]: value},
            },
        });
    };

    return (
        <Card className="border-primary/20">
            <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-1 text-lg text-primary">
                    <span>Atributos</span>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-default text-muted-foreground"/>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Campo tracejado: bônus de item ou antecedente na salvaguarda.</p>
                            <p>Checkbox: proficiente na salvaguarda.</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 px-4 pb-4" onBlur={onBlur}>
                {ABILITY_KEYS.map(key => {
                    const mod = getModifier(sheet.abilities[key].value);
                    const stBonus = sheet.bonuses?.savingThrows?.[key] ?? 0;
                    const stTotal = getSavingThrowBonus(
                        sheet.abilities[key].value,
                        sheet.abilities[key].proficient,
                        profBonus,
                        stBonus,
                    );
                    const showTotal = sheet.abilities[key].proficient || stBonus !== 0;

                    return (
                        <div key={key} className="flex items-center gap-2">
                            {/* Abreviação */}
                            <span className="w-10 shrink-0 text-sm font-semibold text-muted-foreground">
                {ABILITY_ABBR[key]}
              </span>

                            {/* Valor do atributo */}
                            <NumericInput
                                min={1}
                                max={30}
                                fallback={10}
                                value={sheet.abilities[key].value}
                                onChange={v => handleValue(key, v)}
                                className="h-9 w-14 text-center text-sm"
                            />

                            {/* Modificador base */}
                            <span className="w-8 text-center text-sm font-bold text-primary">
                {formatModifier(mod)}
              </span>
                            <BonusInput
                                value={stBonus}
                                onChange={v => handleSavingThrowBonus(key, v)}
                                title={`Bônus extra na salvaguarda de ${ABILITY_ABBR[key]} (item, antecedente…)`}
                                widthClass="w-9"
                                heightClass="h-9"
                            />
                            {showTotal ? (
                                <span className="w-8 text-center text-sm font-bold text-primary">
                  {formatModifier(stTotal)}
                </span>
                            ) : (
                                <span className="w-8 shrink-0"/>
                            )}
                            <Checkbox
                                checked={sheet.abilities[key].proficient}
                                onCheckedChange={c => handleProficient(key, !!c)}
                                className="h-4 w-4"
                                aria-label={`Proficiente em salvaguarda de ${ABILITY_ABBR[key]}`}
                                title="Proficiente em Salvaguarda"
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}