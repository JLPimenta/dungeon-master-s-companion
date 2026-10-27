import { Label } from '@/components/ui/label';
import { SheetSection } from '@/systems/shared/SheetSection';
import { Textarea } from '@/components/ui/textarea';
import { type T20SectionProps } from './common';
import type { T20Sheet } from '../types';

type StoryKey = 'description' | 'history' | 'notes';

const FIELDS: { key: StoryKey; label: string; placeholder: string; max: number; private?: boolean }[] = [
  { key: 'description', label: 'Descrição', placeholder: 'Aparência, personalidade, maneirismos…', max: 10_000 },
  { key: 'history', label: 'Histórico', placeholder: 'De onde veio, o que busca…', max: 10_000 },
  { key: 'notes', label: 'Anotações', placeholder: 'Negócios, parceiros, tesouros, aliados…', max: 10_000, private: true },
];

export function T20Story({ sheet, onChange, onBlur, readOnly }: T20SectionProps) {
  const fields = readOnly ? FIELDS.filter(f => !f.private) : FIELDS;

  return (
    <SheetSection title="Descrição e Histórico" collapse="mobile" onBlur={onBlur}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {fields.map(f => (
          <div key={f.key}>
            <Label className="text-sm text-muted-foreground">{f.label}</Label>
            <Textarea
              maxLength={f.max}
              placeholder={f.placeholder}
              value={sheet[f.key] ?? ''}
              onChange={e => onChange({ [f.key]: e.target.value } as Partial<T20Sheet>)}
              className="mt-1 min-h-[140px] text-sm"
            />
          </div>
        ))}
      </div>
    </SheetSection>
  );
}
