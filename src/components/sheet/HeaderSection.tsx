import type { CharacterSheet } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProficiencyBonus } from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function HeaderSection({ sheet, onChange }: Props) {
  const profBonus = getProficiencyBonus(sheet.level);

  return (
    <Card className="border-primary/20">
      <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-2">
          <Label className="text-xs text-muted-foreground">Nome</Label>
          <Input value={sheet.name} onChange={e => onChange({ name: e.target.value })} className="mt-1 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Classe</Label>
          <Input value={sheet.class} onChange={e => onChange({ class: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Nível</Label>
          <Input type="number" min={1} max={20} value={sheet.level} onChange={e => onChange({ level: Number(e.target.value) || 1 })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Espécie</Label>
          <Input value={sheet.species} onChange={e => onChange({ species: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Subclasse</Label>
          <Input value={sheet.subclass} onChange={e => onChange({ subclass: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Antecedente</Label>
          <Input value={sheet.background} onChange={e => onChange({ background: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">XP</Label>
          <Input type="number" min={0} value={sheet.xp} onChange={e => onChange({ xp: Number(e.target.value) || 0 })} className="mt-1" />
        </div>
        <div className="flex items-end">
          <div className="flex h-10 w-full items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
            Proficiência +{profBonus}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
