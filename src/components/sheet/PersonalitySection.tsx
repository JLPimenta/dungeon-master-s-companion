import type { CharacterSheet } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function PersonalitySection({ sheet, onChange }: Props) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-lg text-primary">Personalidade e História</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div>
          <Label className="text-sm text-muted-foreground">História e Personalidade</Label>
          <Textarea value={sheet.personalityAndHistory} onChange={e => onChange({ personalityAndHistory: e.target.value })} className="mt-1 min-h-[100px] text-sm" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-sm text-muted-foreground">Alinhamento</Label>
            <Input value={sheet.alignment} onChange={e => onChange({ alignment: e.target.value })} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Idiomas</Label>
            <Input value={sheet.languages} onChange={e => onChange({ languages: e.target.value })} className="mt-1 h-9 text-sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
