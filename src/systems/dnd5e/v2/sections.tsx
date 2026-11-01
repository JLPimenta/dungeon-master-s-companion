import { cn } from '@/lib/utils';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { EditToggle, ReadText, useEditing } from '@/systems/shared/ui/ViewEditBlock';
import { IdentityGrid, TextBlockCard, type IdentityField } from '@/systems/shared/ui/IdentityGrid';
import { TextAreaField } from '@/systems/shared/ui/fields';
import { EntryListCard } from '@/systems/shared/sections/EntryList';
import { useDndSheet, type DndRules } from '@/systems/dnd-common/v2/context';
import type { Dnd5eCharacteristics, Dnd5eSheet } from '../types';

/*
 * Seções exclusivas da ficha D&D 5e (2014) no redesign v2. O resto (vitais,
 * atributos, perícias, armas, magias, mochila) vem do núcleo D&D.
 */

/** Regras da 5e: "Inspiração" e no máximo 3 itens sintonizados. */
export const DND5E_RULES: DndRules = {
  inspirationLabel: 'Inspiração',
  attunementLimit: () => 3,
  attunementNote: 'Limite de 3 itens sintonizados',
};

/** Identidade completa (Perfil, celular e tablet). */
export const IDENTITY_5E: IdentityField[] = [
  { key: 'name', label: 'Nome', wide: true, maxLength: 255 },
  { key: 'class', label: 'Classe', placeholder: 'Ex: Guerreiro' },
  { key: 'level', label: 'Nível', number: true, min: 1, max: 20 },
  { key: 'race', label: 'Raça', placeholder: 'Ex: Anão da Montanha' },
  { key: 'background', label: 'Antecedente', placeholder: 'Ex: Soldado' },
  { key: 'alignment', label: 'Tendência', placeholder: 'Ex: Leal e Bom' },
  { key: 'playerName', label: 'Jogador' },
  { key: 'xp', label: 'XP', number: true, min: 0, maxDigits: 7 },
];

/** Cabeçalho do computador: os mesmos campos em uma linha. */
export const DESKTOP_IDENTITY_5E = IDENTITY_5E;

/** Idiomas e outras proficiências. */
export function ProficienciesCard({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  return (
    <TextBlockCard
      id="proficiencies"
      title="Idiomas e proficiências"
      value={sheet.proficienciesAndLanguages}
      onChange={v => update({ proficienciesAndLanguages: v })}
      readOnly={readOnly}
      maxLength={2000}
      placeholder="Comum, Anão; armaduras leves e médias; ferramentas de ferreiro…"
      className={className}
    />
  );
}

const PERSONALITY: { key: 'personalityTraits' | 'ideals' | 'bonds' | 'flaws'; label: string; placeholder: string }[] = [
  { key: 'personalityTraits', label: 'Traços de personalidade', placeholder: 'Como o personagem age e fala…' },
  { key: 'ideals', label: 'Ideais', placeholder: 'No que acredita…' },
  { key: 'bonds', label: 'Ligações', placeholder: 'Pessoas, lugares e causas que importam…' },
  { key: 'flaws', label: 'Defeitos', placeholder: 'Vícios, medos, fraquezas…' },
];

/** Personalidade: os quatro campos da ficha oficial em um cartão. */
export function PersonalityCard({ className, columns = 1 }: { className?: string; columns?: 1 | 2 }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  const { isEditing, start, done } = useEditing('personality');
  const editing = isEditing && !readOnly;
  return (
    <SheetCard
      id="personalidade"
      title="Personalidade"
      className={className}
      action={!readOnly && <EditToggle isEditing={editing} onStart={start} onDone={done} label="personalidade" />}
    >
      <div className={cn('grid gap-4', columns === 2 && 'grid-cols-2')}>
        {PERSONALITY.map(f => editing ? (
          <TextAreaField key={f.key} label={f.label} value={sheet[f.key]} placeholder={f.placeholder} maxLength={2000} minRows={3}
            onChange={v => update({ [f.key]: v } as Partial<Dnd5eSheet>)} />
        ) : (
          <div key={f.key} className="flex flex-col gap-1">
            <span className="text-sm italic text-muted-foreground">{f.label}</span>
            <ReadText text={sheet[f.key]} empty="—" />
          </div>
        ))}
      </div>
    </SheetCard>
  );
}

/** Características e habilidades (lista nome + descrição). */
export function FeaturesCard({ className, bare }: { className?: string; bare?: boolean }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  return (
    <EntryListCard
      id="tracos"
      title="Características e habilidades"
      items={sheet.features}
      onChange={features => update({ features })}
      readOnly={readOnly}
      addLabel="Nova característica"
      newItemLabel="Nova característica"
      emptyText="Nenhuma característica adicionada."
      descriptionPlaceholder="Origem (classe, raça, talento), usos, recarga…"
      className={className}
      bare={bare}
    />
  );
}

const CHARACTERISTICS: IdentityField[] = [
  { key: 'age', label: 'Idade', maxLength: 50 },
  { key: 'height', label: 'Altura', maxLength: 50 },
  { key: 'weight', label: 'Peso', maxLength: 50 },
  { key: 'eyes', label: 'Olhos', maxLength: 50 },
  { key: 'skin', label: 'Pele', maxLength: 50 },
  { key: 'hair', label: 'Cabelos', maxLength: 50 },
];

/** Descrição do personagem (página 2 da ficha oficial): características físicas e aparência. */
export function CharacterDescriptionCard({ className, wide }: { className?: string; wide?: boolean }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  const { isEditing, start, done } = useEditing('characteristics');
  const editing = isEditing && !readOnly;
  const chars = (sheet.characteristics ?? {}) as Dnd5eCharacteristics;
  return (
    <SheetCard
      title="Descrição do personagem"
      className={className}
      action={!readOnly && <EditToggle isEditing={editing} onStart={start} onDone={done} label="descrição do personagem" />}
    >
      <IdentityGrid
        fields={CHARACTERISTICS}
        values={chars as unknown as Record<string, unknown>}
        onChange={(key, value) => update({ characteristics: { ...chars, [key]: value } as Dnd5eCharacteristics })}
        columns={wide ? 3 : 2}
        editing={editing}
      />
    </SheetCard>
  );
}

const LONG_TEXTS: { key: 'appearance' | 'backstory' | 'alliesAndOrganizations'; title: string; placeholder: string }[] = [
  { key: 'appearance', title: 'Aparência', placeholder: 'Como o personagem se apresenta…' },
  { key: 'backstory', title: 'História', placeholder: 'De onde veio, o que o move…' },
  { key: 'alliesAndOrganizations', title: 'Aliados e organizações', placeholder: 'Facções, mentores, contatos…' },
];

/** Aparência, História, Aliados e organizações. */
export function LongTexts({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  return (
    <>
      {LONG_TEXTS.map(t => (
        <TextBlockCard key={t.key} id={t.key} title={t.title} value={sheet[t.key]} placeholder={t.placeholder}
          readOnly={readOnly} className={className} onChange={v => update({ [t.key]: v } as Partial<Dnd5eSheet>)} />
      ))}
    </>
  );
}

/** Tesouro (privado: some no somente leitura, como na v1). */
export function TreasureCard({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  if (readOnly) return null;
  return (
    <TextBlockCard id="treasure" title="Tesouro" value={sheet.treasure} readOnly={readOnly} className={className}
      placeholder="Gemas, obras de arte, itens de valor…" onChange={v => update({ treasure: v })} />
  );
}
