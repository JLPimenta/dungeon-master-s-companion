import type { SheetComponentProps } from '../types';
import { SheetSection } from '@/systems/shared/SheetSection';
import type { T20Sheet } from './types';
import { Textarea } from '@/components/ui/textarea';
import { CampaignNotes } from '@/components/sheet/CampaignNotes';
import { CustomFields } from '@/components/sheet/CustomFields';
import { T20Header } from './sections/T20Header';
import { T20Attributes } from './sections/T20Attributes';
import { T20Skills } from './sections/T20Skills';
import { T20Combat } from './sections/T20Combat';
import { T20Attacks } from './sections/T20Attacks';
import { EntryListSection } from '@/systems/shared/EntryListSection';
import { T20Spells } from './sections/T20Spells';
import { T20Equipment } from './sections/T20Equipment';
import { T20Story } from './sections/T20Story';

const noop = () => {};

/**
 * Ficha Tormenta20, na ordem da ficha oficial: identificação, atributos e
 * perícias à esquerda; combate, ataques e habilidades à direita; magias,
 * equipamento e textos longos em largura total.
 *
 * Em `readOnly` (link compartilhado) ficam ocultos Equipamento, Anotações,
 * Notas da Campanha e Campos Personalizados — mesmo critério do 5.5e.
 */
export function T20SheetLayout({ sheet, onChange, onBlur, readOnly = false }: SheetComponentProps<T20Sheet>) {
  const update = readOnly ? noop : onChange;
  const blur = readOnly ? undefined : onBlur;
  const props = { sheet, onChange: update, onBlur: blur, readOnly };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <T20Header {...props} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <T20Attributes {...props} />
          <T20Skills {...props} />
        </div>

        {/* Coluna da direita: seções de altura limitada + um card que estica
            até o fim da coluna (padrão do 5.5e). Listas que crescem ficam
            abaixo, em largura total — aqui elas deixariam espaço vazio à esquerda. */}
        <div className="flex h-full flex-col space-y-6">
          <T20Combat {...props} />
          <T20Attacks {...props} />
          <div className="flex-1">
            <SheetSection title="Proficiências" collapse="mobile" fill onBlur={blur}>
              <Textarea
                aria-label="Proficiências"
                maxLength={2_000}
                placeholder="Armas simples, armaduras leves, escudos…"
                value={sheet.proficiencies ?? ''}
                onChange={e => update({ proficiencies: e.target.value })}
                className="min-h-[120px] flex-1 resize-none text-sm"
              />
            </SheetSection>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <EntryListSection
          title="Habilidades de Raça e Origem"
          emptyText="Nenhuma habilidade de raça ou origem."
          newItemLabel="Nova habilidade"
          items={sheet.raceOriginAbilities}
          onChange={raceOriginAbilities => update({ raceOriginAbilities })}
          onBlur={blur}
          readOnly={readOnly}
          descriptionPlaceholder="O que faz, custo em PM, pré-requisitos…"
        />
        <EntryListSection
          title="Habilidades de Classe e Poderes"
          emptyText="Nenhuma habilidade de classe ou poder."
          newItemLabel="Novo poder"
          items={sheet.classAbilities}
          onChange={classAbilities => update({ classAbilities })}
          onBlur={blur}
          readOnly={readOnly}
          descriptionPlaceholder="O que faz, custo em PM, pré-requisitos…"
        />
      </div>

      <T20Spells {...props} />
      {!readOnly && <T20Equipment {...props} />}
      <T20Story {...props} />
      {!readOnly && <CampaignNotes sheet={sheet} onChange={update} onBlur={blur} />}
      {!readOnly && <CustomFields sheet={sheet} onChange={update} onBlur={blur} />}
    </div>
  );
}
