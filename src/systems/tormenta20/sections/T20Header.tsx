import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumericInput } from '@/components/ui/numeric-input';
import { SheetHeaderCard } from '@/systems/shared/SheetHeaderCard';
import type { T20SectionProps } from './common';
import { defenseTotal } from '../rules';
import type { T20Sheet } from '../types';

type TextKey = 'player' | 'race' | 'origin' | 'class' | 'deity';

const TEXT_FIELDS: { key: TextKey; label: string; placeholder: string }[] = [
  { key: 'class', label: 'Classe', placeholder: 'Ex: Clérigo' },
  { key: 'race', label: 'Raça', placeholder: 'Ex: Anão' },
  { key: 'origin', label: 'Origem', placeholder: 'Ex: Acólito' },
  { key: 'deity', label: 'Divindade', placeholder: 'Ex: Khalmyr' },
  { key: 'player', label: 'Jogador', placeholder: '' },
];

export function T20Header({ sheet, onChange, onBlur }: T20SectionProps) {
  const renderText = (f: (typeof TEXT_FIELDS)[number]) => (
    <div key={f.key}>
      <Label className="text-sm text-muted-foreground">{f.label}</Label>
      <Input
        maxLength={100}
        value={sheet[f.key] ?? ''}
        placeholder={f.placeholder}
        onChange={e => onChange({ [f.key]: e.target.value } as Partial<T20Sheet>)}
        className="mt-1 text-sm"
      />
    </div>
  );

  return (
    <SheetHeaderCard
      name={sheet.name}
      summary={[sheet.class, sheet.level != null && `Nível ${sheet.level}`, sheet.race]}
      badge={`Defesa ${defenseTotal(sheet)}`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" onBlur={onBlur}>
        <div className="col-span-2">
          <Label className="text-sm text-muted-foreground">Nome</Label>
          <Input
            maxLength={255}
            value={sheet.name}
            onChange={e => onChange({ name: e.target.value })}
            className="mt-1 text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading)' }}
          />
        </div>

        {TEXT_FIELDS.slice(0, 1).map(renderText)}

        <div>
          <Label className="text-sm text-muted-foreground">Nível</Label>
          <NumericInput min={1} max={20} fallback={1} value={sheet.level} onChange={v => onChange({ level: v })} className="mt-1 text-sm" />
        </div>

        {TEXT_FIELDS.slice(1).map(renderText)}

        <div>
          <Label className="text-sm text-muted-foreground">Experiência</Label>
          <NumericInput min={0} value={sheet.xp} onChange={v => onChange({ xp: v })} className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="block truncate text-sm text-muted-foreground" title="Pontos entre aventuras">Pts. entre aventuras</Label>
          <NumericInput min={0} value={sheet.downtimePoints} onChange={v => onChange({ downtimePoints: v })} className="mt-1 text-sm" />
        </div>
      </div>
    </SheetHeaderCard>
  );
}
