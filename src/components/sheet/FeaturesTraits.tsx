import type { CharacterSheet } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function FeaturesTraits({ sheet, onChange }: Props) {
  const addFeature = () => {
    onChange({ classFeatures: [...sheet.classFeatures, ''] });
  };

  const updateFeature = (idx: number, val: string) => {
    const classFeatures = [...sheet.classFeatures];
    classFeatures[idx] = val;
    onChange({ classFeatures });
  };

  const removeFeature = (idx: number) => {
    onChange({ classFeatures: sheet.classFeatures.filter((_, i) => i !== idx) });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm text-primary">Características e Traços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        {/* Class features */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Características de Classe</Label>
            <Button variant="ghost" size="sm" onClick={addFeature} className="h-6 gap-1 text-xs">
              <Plus className="h-3 w-3" /> Adicionar
            </Button>
          </div>
          {sheet.classFeatures.map((f, i) => (
            <div key={i} className="mb-1.5 flex gap-2">
              <Input value={f} onChange={e => updateFeature(i, e.target.value)} className="h-8 text-xs" />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeFeature(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Traços de Espécie</Label>
          <Textarea value={sheet.speciesTraits} onChange={e => onChange({ speciesTraits: e.target.value })} className="mt-1 min-h-[60px] text-sm" />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Talentos</Label>
          <Textarea value={sheet.feats} onChange={e => onChange({ feats: e.target.value })} className="mt-1 min-h-[60px] text-sm" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs text-muted-foreground">Armaduras</Label>
            <Input value={sheet.armorTraining} onChange={e => onChange({ armorTraining: e.target.value })} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Armas</Label>
            <Input value={sheet.weaponTraining} onChange={e => onChange({ weaponTraining: e.target.value })} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ferramentas</Label>
            <Input value={sheet.toolTraining} onChange={e => onChange({ toolTraining: e.target.value })} className="mt-1 h-8 text-xs" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
