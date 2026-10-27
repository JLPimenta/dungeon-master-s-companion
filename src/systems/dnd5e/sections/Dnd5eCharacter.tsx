import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SheetSection } from '@/systems/shared/SheetSection';
import type { Dnd5eSectionProps } from './props';
import type { Dnd5eCharacteristics, Dnd5eSheet } from '../types';

const CHARACTERISTICS: { key: keyof Dnd5eCharacteristics; label: string }[] = [
  { key: 'age', label: 'Idade' },
  { key: 'height', label: 'Altura' },
  { key: 'weight', label: 'Peso' },
  { key: 'eyes', label: 'Olhos' },
  { key: 'skin', label: 'Pele' },
  { key: 'hair', label: 'Cabelos' },
];

type TextKey = 'appearance' | 'backstory' | 'alliesAndOrganizations' | 'treasure';

const TEXTS: { key: TextKey; label: string; placeholder: string; private?: boolean }[] = [
  { key: 'appearance', label: 'Aparência', placeholder: 'Como o personagem se apresenta…' },
  { key: 'backstory', label: 'História', placeholder: 'De onde veio, o que o move…' },
  { key: 'alliesAndOrganizations', label: 'Aliados e Organizações', placeholder: 'Facções, mentores, contatos…' },
  { key: 'treasure', label: 'Tesouro', placeholder: 'Gemas, obras de arte, itens de valor…', private: true },
];

/** Página 2 da ficha oficial: características físicas, aparência e história. */
export function Dnd5eCharacter({ sheet, onChange, onBlur, readOnly }: Dnd5eSectionProps) {
  const texts = readOnly ? TEXTS.filter(t => !t.private) : TEXTS;

  return (
    <SheetSection title="Descrição do Personagem" collapse="always" onBlur={onBlur}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CHARACTERISTICS.map(c => (
          <div key={c.key}>
            <Label className="text-sm text-muted-foreground">{c.label}</Label>
            <Input
              maxLength={50}
              value={sheet.characteristics?.[c.key] ?? ''}
              onChange={e => onChange({ characteristics: { ...sheet.characteristics, [c.key]: e.target.value } })}
              className="mt-1 h-9 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {texts.map(t => (
          <div key={t.key}>
            <Label className="text-sm text-muted-foreground">{t.label}</Label>
            <Textarea
              maxLength={10_000}
              placeholder={t.placeholder}
              value={sheet[t.key] ?? ''}
              onChange={e => onChange({ [t.key]: e.target.value } as Partial<Dnd5eSheet>)}
              className="mt-1 min-h-[120px] text-sm"
            />
          </div>
        ))}
      </div>
    </SheetSection>
  );
}
