import { useState } from 'react';
import type { CharacterSheet } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function FeaturesTraits({ sheet, onChange }: Props) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);

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
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex w-full items-center justify-between"
        >
          <CardTitle className="text-lg text-primary">Características e Traços</CardTitle>
          <span className="text-muted-foreground md:hidden">
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </span>
        </button>
      </CardHeader>

      {(!collapsed || !isMobile) && (
        <CardContent className="space-y-4 px-4 pb-4">
          {/* Class features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-muted-foreground">Características de Classe</Label>
              <Button variant="ghost" size="sm" onClick={addFeature} className="h-8 gap-1 text-sm">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            {sheet.classFeatures.map((f, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <Textarea
                  value={f}
                  onChange={e => updateFeature(i, e.target.value)}
                  className="min-h-[72px] resize-y text-sm"
                  placeholder="Descreva a característica…"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 self-start text-muted-foreground hover:text-destructive"
                  onClick={() => removeFeature(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Traços de Espécie</Label>
            <Textarea value={sheet.speciesTraits} onChange={e => onChange({ speciesTraits: e.target.value })} className="mt-1 min-h-[60px] text-sm" />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Talentos</Label>
            <Textarea value={sheet.feats} onChange={e => onChange({ feats: e.target.value })} className="mt-1 min-h-[60px] text-sm" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-sm text-muted-foreground">Armaduras</Label>
              <Input value={sheet.armorTraining} onChange={e => onChange({ armorTraining: e.target.value })} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Armas</Label>
              <Input value={sheet.weaponTraining} onChange={e => onChange({ weaponTraining: e.target.value })} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Ferramentas</Label>
              <Input value={sheet.toolTraining} onChange={e => onChange({ toolTraining: e.target.value })} className="mt-1 h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
