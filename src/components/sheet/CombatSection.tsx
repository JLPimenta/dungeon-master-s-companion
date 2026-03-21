import type { CharacterSheet } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getInitiativeBonus, formatModifier } from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function CombatSection({ sheet, onChange }: Props) {
  const initBonus = getInitiativeBonus(sheet);

  const setDeathSave = (type: 'successes' | 'failures', val: number) => {
    onChange({ deathSaves: { ...sheet.deathSaves, [type]: Math.min(3, Math.max(0, val)) } });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-lg text-primary">Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label className="text-sm text-muted-foreground">CA</Label>
            <Input type="number" value={sheet.armorClass} onChange={e => onChange({ armorClass: Number(e.target.value) || 0 })} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Iniciativa</Label>
            <div className="mt-1 flex h-10 items-center rounded-md border border-input bg-input/30 px-3 text-sm font-bold text-primary">
              {formatModifier(initBonus)}
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Deslocamento</Label>
            <Input type="number" value={sheet.speed} onChange={e => onChange({ speed: Number(e.target.value) || 0 })} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Tamanho</Label>
            <Input value={sheet.size} onChange={e => onChange({ size: e.target.value })} className="mt-1 h-10" />
          </div>
        </div>

        {/* Hit Points */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <Label className="text-sm text-muted-foreground">PV Atual</Label>
            <Input type="number" value={sheet.hitPoints.current} onChange={e => onChange({ hitPoints: { ...sheet.hitPoints, current: Number(e.target.value) || 0 } })} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">PV Máx</Label>
            <Input type="number" value={sheet.hitPoints.max} onChange={e => onChange({ hitPoints: { ...sheet.hitPoints, max: Number(e.target.value) || 0 } })} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">PV Temp</Label>
            <Input type="number" value={sheet.hitPoints.temp} onChange={e => onChange({ hitPoints: { ...sheet.hitPoints, temp: Number(e.target.value) || 0 } })} className="mt-1 h-10" />
          </div>
        </div>

        {/* Hit Dice */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm text-muted-foreground">Dado de Vida (total)</Label>
            <Input value={sheet.hitDice.total} onChange={e => onChange({ hitDice: { ...sheet.hitDice, total: e.target.value } })} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Dados Usados</Label>
            <Input type="number" min={0} value={sheet.hitDice.used} onChange={e => onChange({ hitDice: { ...sheet.hitDice, used: Number(e.target.value) || 0 } })} className="mt-1 h-10" />
          </div>
        </div>

        {/* Death saves */}
        <div className="mt-4">
          <Label className="text-sm text-muted-foreground">Salvaguarda contra Morte</Label>
          <div className="mt-2 flex gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sucesso</span>
              {[0, 1, 2].map(i => (
                <Checkbox key={i} checked={sheet.deathSaves.successes > i}
                  onCheckedChange={() => setDeathSave('successes', sheet.deathSaves.successes > i ? i : i + 1)}
                  className="h-5 w-5" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Falha</span>
              {[0, 1, 2].map(i => (
                <Checkbox key={i} checked={sheet.deathSaves.failures > i}
                  onCheckedChange={() => setDeathSave('failures', sheet.deathSaves.failures > i ? i : i + 1)}
                  className="h-5 w-5" />
              ))}
            </div>
          </div>
        </div>

        {/* Heroic Inspiration */}
        <div className="mt-4 flex items-center gap-2">
          <Checkbox checked={sheet.heroicInspiration} onCheckedChange={c => onChange({ heroicInspiration: !!c })} className="h-5 w-5" />
          <span className="text-sm">Inspiração Heroica</span>
        </div>
      </CardContent>
    </Card>
  );
}
