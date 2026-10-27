import type { SheetComponentProps } from '../types';
import type { Dnd5eSheet } from './types';
import { Textarea } from '@/components/ui/textarea';
import { SheetSection } from '@/systems/shared/SheetSection';
import { EntryListSection } from '@/systems/shared/EntryListSection';
// Seções da família D&D, compartilhadas com o 5.5e (ver dnd-common/types.ts)
import { AbilityScores } from '@/components/sheet/AbilityScores';
import { SkillsSection } from '@/components/sheet/SkillsSection';
import { CombatSection } from '@/components/sheet/CombatSection';
import { WeaponsTable } from '@/components/sheet/WeaponsTable';
import { SpellcastingSection } from '@/components/sheet/SpellcastingSection';
import { InventorySection } from '@/components/sheet/InventorySection';
// Recursos do Grimório, comuns a todos os sistemas
import { CampaignNotes } from '@/components/sheet/CampaignNotes';
import { CustomFields } from '@/components/sheet/CustomFields';
// Seções próprias do 5e
import { Dnd5eHeader } from './sections/Dnd5eHeader';
import { Dnd5ePersonality } from './sections/Dnd5ePersonality';
import { Dnd5eCharacter } from './sections/Dnd5eCharacter';

const noop = () => {};

/** Itens sintonizados nas regras de 2014 (a regra da casa por proficiência é do 5.5e). */
const MAX_ATTUNED_ITEMS_5E = 3;

/**
 * Ficha D&D 5e (2014), na ordem da ficha oficial. Em `readOnly` (link
 * compartilhado) ficam ocultos Inventário, Tesouro, Notas da Campanha e
 * Campos Personalizados — mesmo critério do 5.5e.
 */
export function Dnd5eSheetLayout({ sheet, onChange, onBlur, readOnly = false }: SheetComponentProps<Dnd5eSheet>) {
  const update = readOnly ? noop : onChange;
  const blur = readOnly ? undefined : onBlur;
  const props = { sheet, onChange: update, onBlur: blur, readOnly };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Dnd5eHeader {...props} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Coluna da esquerda, como na ficha oficial: atributos, perícias e,
            no fim, idiomas e outras proficiências. */}
        <div className="space-y-6">
          <AbilityScores sheet={sheet} onChange={update} onBlur={blur} />
          <SkillsSection sheet={sheet} onChange={update} onBlur={blur} />
          <SheetSection title="Idiomas e Proficiências" onBlur={blur}>
            <Textarea
              aria-label="Idiomas e outras proficiências"
              maxLength={2_000}
              placeholder="Comum, Anão; armaduras leves e médias; ferramentas de ferreiro…"
              value={sheet.proficienciesAndLanguages ?? ''}
              onChange={e => update({ proficienciesAndLanguages: e.target.value })}
              className="min-h-[80px] text-sm"
            />
          </SheetSection>
        </div>

        {/* Coluna da direita: seções de altura limitada + Personalidade, que
            estica até o fim da coluna (padrão do 5.5e). Listas que crescem
            ficam abaixo, em largura total. */}
        <div className="flex h-full flex-col space-y-6">
          <CombatSection sheet={sheet} onChange={update} onBlur={blur} inspirationLabel="Inspiração" />
          <WeaponsTable sheet={sheet} onChange={update} onBlur={blur} />
          <div className="flex-1">
            <Dnd5ePersonality {...props} />
          </div>
        </div>
      </div>

      <SpellcastingSection sheet={sheet} onChange={update} onBlur={blur} />
      {!readOnly && (
        <InventorySection sheet={sheet} onChange={update} onBlur={blur} maxAttunedItems={MAX_ATTUNED_ITEMS_5E} />
      )}
      <EntryListSection
        title="Características e Habilidades"
        emptyText="Nenhuma característica adicionada."
        newItemLabel="Nova característica"
        items={sheet.features}
        onChange={features => update({ features })}
        onBlur={blur}
        readOnly={readOnly}
        descriptionPlaceholder="Origem (classe, raça, talento), usos, recarga…"
      />
      <Dnd5eCharacter {...props} />
      {!readOnly && <CampaignNotes sheet={sheet} onChange={update} onBlur={blur} />}
      {!readOnly && <CustomFields sheet={sheet} onChange={update} onBlur={blur} />}
    </div>
  );
}
