import { DesktopFrame, type SectionLink } from '@/systems/shared/layout/frames';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { NotesList, CustomFieldsList } from '@/systems/shared/sections/NotesAndFields';
import { useDndSheet } from '@/systems/dnd-common/v2/context';
import { DndHeaderCard, InlineAc, InlineHp, useClassSubtitle } from '@/systems/dnd-common/v2/Header';
import { VitalsCard } from '@/systems/dnd-common/v2/Vitals';
import { AbilityRows, SkillsFlat } from '@/systems/dnd-common/v2/Abilities';
import { WeaponsList } from '@/systems/dnd-common/v2/Combat';
import { DndDesktopSpellcasting } from '@/systems/dnd-common/v2/Spells';
import { AttunedList, CoinsCard, EquipmentList } from '@/systems/dnd-common/v2/Inventory';
import { DndPanels } from '@/systems/dnd-common/v2/Panels';
import { DESKTOP_IDENTITY_55, EquipmentTraining, FeaturesList, HistoryCard, SpeciesAndFeats } from '../sections/v2';
import type { Dnd55Sheet } from '../definition';

export const DND_LINKS: SectionLink[] = [
  { href: '#topo', label: 'Ficha' },
  { href: '#atributos', label: 'Atributos' },
  { href: '#armas', label: 'Armas' },
  { href: '#magias', label: 'Magias' },
  { href: '#inventario', label: 'Inventário', private: true },
  { href: '#tracos', label: 'Traços' },
  { href: '#personalidade', label: 'História' },
  { href: '#notas', label: 'Notas', private: true },
  { href: '#campos', label: 'Campos', private: true },
];

/** Ficha 5.5e no computador (≥ 1280 px), no padrão da v1 (docs/redesign-v2/03-ficha.md, "Computador"). */
export function DesktopLayout() {
  const { sheet, update, readOnly } = useDndSheet<Dnd55Sheet>();
  const subtitle = useClassSubtitle('subclass');

  return (
    <DesktopFrame
      title={sheet.name}
      subtitle={subtitle}
      links={DND_LINKS}
      topbarExtra={<><InlineHp className="shrink-0" /><InlineAc /></>}
      overlays={<DndPanels />}
    >
      <DndHeaderCard fields={DESKTOP_IDENTITY_55} />

      <div className="grid grid-cols-[300px_minmax(0,1fr)] items-stretch gap-5">
        <div className="flex flex-col gap-5">
          <AbilityRows />
          <SkillsFlat />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <VitalsCard title="Informações gerais" />
          <WeaponsList table maxHeightClass="max-h-[300px]" />
          <HistoryCard withPersona className="flex-1" />
        </div>
      </div>

      <DndDesktopSpellcasting />

      {!readOnly && (
        <SheetCard id="inventario" title="Inventário">
          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5">
            <AttunedList table bare />
            <CoinsCard bare />
          </div>
          <EquipmentList table bare />
        </SheetCard>
      )}

      <SheetCard title="Características e traços">
        <FeaturesList bare />
        <div className="grid grid-cols-3 items-start gap-5">
          <SpeciesAndFeats />
          <EquipmentTraining />
        </div>
      </SheetCard>

      {!readOnly && (
        <>
          <NotesList notes={sheet.campaignNotes} onChange={n => update({ campaignNotes: n })} grid />
          <CustomFieldsList fields={sheet.customFields} onChange={f => update({ customFields: f })} />
        </>
      )}
    </DesktopFrame>
  );
}
