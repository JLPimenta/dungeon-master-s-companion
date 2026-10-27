import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SheetSection } from '@/systems/shared/SheetSection';
import type { Dnd5eSectionProps } from './props';
import type { Dnd5eSheet } from '../types';

type Key = 'personalityTraits' | 'ideals' | 'bonds' | 'flaws';

const FIELDS: { key: Key; label: string; placeholder: string }[] = [
  { key: 'personalityTraits', label: 'Traços de Personalidade', placeholder: 'Como o personagem age e fala…' },
  { key: 'ideals', label: 'Ideais', placeholder: 'No que acredita…' },
  { key: 'bonds', label: 'Ligações', placeholder: 'Pessoas, lugares e causas que importam…' },
  { key: 'flaws', label: 'Defeitos', placeholder: 'Vícios, medos, fraquezas…' },
];

/**
 * Card que estica até o fim da coluna da direita, como "Personalidade e
 * História" no 5.5e: os quatro campos dividem a altura disponível.
 */
export function Dnd5ePersonality({ sheet, onChange, onBlur }: Dnd5eSectionProps) {
  return (
    <SheetSection title="Personalidade" collapse="mobile" fill onBlur={onBlur}>
      <div className="grid flex-1 grid-cols-1 gap-3 sm:auto-rows-fr sm:grid-cols-2">
        {FIELDS.map(f => (
          <div key={f.key} className="flex flex-col">
            <Label className="mb-1.5 text-sm text-muted-foreground">{f.label}</Label>
            <Textarea
              maxLength={2_000}
              placeholder={f.placeholder}
              value={sheet[f.key] ?? ''}
              onChange={e => onChange({ [f.key]: e.target.value } as Partial<Dnd5eSheet>)}
              className="min-h-[80px] flex-1 resize-none text-sm"
            />
          </div>
        ))}
      </div>
    </SheetSection>
  );
}
