import type { CharacterSheet } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BonusInput } from '@/components/ui/bonus-input';
import { getInitiativeBonus, formatModifier } from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
  onBlur?: () => void;
}

export function CombatSection({ sheet, onChange, onBlur }: Props) {
  // getInitiativeBonus já soma sheet.bonuses?.initiative internamente
  const initTotal = getInitiativeBonus(sheet);
  const initBonus = sheet.bonuses?.initiative ?? 0;

  const handleInitiativeBonus = (value: number) => {
    onChange({ bonuses: { ...sheet.bonuses, initiative: value } });
  };

  const setDeathSave = (type: 'successes' | 'failures', val: number) => {
    onChange({ deathSaves: { ...sheet.deathSaves, [type]: Math.min(3, Math.max(0, val)) } });
  };

  return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-lg text-primary">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4" onBlur={onBlur}>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <Label className="text-sm text-muted-foreground">CA</Label>
              <NumericInput
                  min={0}
                  value={sheet.armorClass}
                  onChange={v => onChange({ armorClass: v })}
                  className="mt-1 h-10 text-sm"
              />
            </div>

            {/*
            Iniciativa: [total calculado] [BonusInput]
            Layout flex dentro da célula de grid.
          */}
            <div>
              <Label className="text-sm text-muted-foreground">Iniciativa</Label>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-input/30 text-sm font-bold text-primary">
                  {formatModifier(initTotal)}
                </div>
                <BonusInput
                    value={initBonus}
                    onChange={handleInitiativeBonus}
                    title="Bônus adicional na Iniciativa (antecedente, item…)"
                    heightClass="h-10"
                    widthClass="w-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Deslocamento</Label>
              <NumericInput
                  min={0}
                  value={sheet.speed}
                  onChange={v => onChange({ speed: v })}
                  className="mt-1 h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Tamanho</Label>
              <Input
                  value={sheet.size}
                  onChange={e => onChange({ size: e.target.value })}
                  className="mt-1 h-10 text-sm"
              />
            </div>
          </div>

          {/* Pontos de Vida */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm text-muted-foreground">PV Atual</Label>
              <NumericInput
                  min={0}
                  value={sheet.hitPoints.current}
                  onChange={v => onChange({ hitPoints: { ...sheet.hitPoints, current: v } })}
                  className="mt-1 h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">PV Máx</Label>
              <NumericInput
                  min={1}
                  fallback={1}
                  value={sheet.hitPoints.max}
                  onChange={v => onChange({ hitPoints: { ...sheet.hitPoints, max: v } })}
                  className="mt-1 h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">PV Temp</Label>
              <NumericInput
                  min={0}
                  value={sheet.hitPoints.temp}
                  onChange={v => onChange({ hitPoints: { ...sheet.hitPoints, temp: v } })}
                  className="mt-1 h-10 text-sm"
              />
            </div>
          </div>

          {/* Dado de Vida */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-muted-foreground">Dado de Vida (total)</Label>
              <Input
                  value={sheet.hitDice.total}
                  onChange={e => onChange({ hitDice: { ...sheet.hitDice, total: e.target.value } })}
                  className="mt-1 h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Dados Usados</Label>
              <NumericInput
                  min={0}
                  value={sheet.hitDice.used}
                  onChange={v => onChange({ hitDice: { ...sheet.hitDice, used: v } })}
                  className="mt-1 h-10 text-sm"
              />
            </div>
          </div>

          {/* Salvaguarda contra a Morte */}
          <div className="mt-4">
            <Label className="text-sm text-muted-foreground">Salvaguarda contra Morte</Label>
            <div className="mt-2 flex gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sucesso</span>
                {[0, 1, 2].map(i => (
                    <Checkbox
                        key={i}
                        checked={sheet.deathSaves.successes > i}
                        onCheckedChange={() =>
                            setDeathSave('successes', sheet.deathSaves.successes > i ? i : i + 1)
                        }
                        className="h-4 w-4"
                    />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Falha</span>
                {[0, 1, 2].map(i => (
                    <Checkbox
                        key={i}
                        checked={sheet.deathSaves.failures > i}
                        onCheckedChange={() =>
                            setDeathSave('failures', sheet.deathSaves.failures > i ? i : i + 1)
                        }
                        className="h-4 w-4"
                    />
                ))}
              </div>
            </div>
          </div>

          {/* Inspiração Heroica */}
          <div className="mt-4 flex items-center gap-2">
            <Checkbox
                checked={sheet.heroicInspiration}
                onCheckedChange={c => onChange({ heroicInspiration: !!c })}
                className="h-4 w-4"
            />
            <span className="text-sm">Inspiração Heroica</span>
          </div>

        </CardContent>
      </Card>
  );
}