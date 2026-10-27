import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumericInput } from '@/components/ui/numeric-input';
import { BonusInput } from '@/components/ui/bonus-input';
import { SheetHeaderCard } from '@/systems/shared/SheetHeaderCard';
import { getEffectiveProficiencyBonus } from '@/utils/calculations';
import type { Dnd5eSectionProps } from './props';
import type { Dnd5eSheet } from '../types';

type TextKey = 'class' | 'race' | 'background' | 'alignment' | 'playerName';

const TEXT_FIELDS: { key: TextKey; label: string; placeholder: string }[] = [
  { key: 'class', label: 'Classe', placeholder: 'Ex: Guerreiro' },
  { key: 'race', label: 'Raça', placeholder: 'Ex: Anão da Montanha' },
  { key: 'background', label: 'Antecedente', placeholder: 'Ex: Soldado' },
  { key: 'alignment', label: 'Tendência', placeholder: 'Ex: Leal e Bom' },
  { key: 'playerName', label: 'Jogador', placeholder: '' },
];

/** Cabeçalho no mesmo formato do 5.5e (recolhível, com proficiência em destaque). */
export function Dnd5eHeader({ sheet, onChange, onBlur }: Dnd5eSectionProps) {
  const profBonus = getEffectiveProficiencyBonus(sheet);

  const renderText = (f: (typeof TEXT_FIELDS)[number]) => (
    <div key={f.key}>
      <Label className="text-sm text-muted-foreground">{f.label}</Label>
      <Input
        maxLength={100}
        value={sheet[f.key] ?? ''}
        placeholder={f.placeholder}
        onChange={e => onChange({ [f.key]: e.target.value } as Partial<Dnd5eSheet>)}
        className="mt-1 text-sm"
      />
    </div>
  );

  return (
    <SheetHeaderCard
      name={sheet.name}
      summary={[sheet.class, sheet.level != null && `Nível ${sheet.level}`, sheet.race]}
      badge={`Proficiência: +${profBonus}`}
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
          <Label className="text-sm text-muted-foreground">XP</Label>
          <NumericInput min={0} value={sheet.xp} onChange={v => onChange({ xp: v })} className="mt-1 text-sm" />
        </div>

        <div className="col-span-2 flex items-end gap-1.5 sm:col-span-1 lg:col-span-2">
          <div className="flex h-10 flex-1 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
            Bônus de Proficiência +{profBonus}
          </div>
          <BonusInput
            value={sheet.bonuses?.proficiencyBonus ?? 0}
            onChange={proficiencyBonus => onChange({ bonuses: { ...sheet.bonuses, proficiencyBonus } })}
            title="Bônus adicional no Bônus de Proficiência (item, característica…)"
            heightClass="h-10"
            widthClass="w-12"
          />
        </div>
      </div>
    </SheetHeaderCard>
  );
}
