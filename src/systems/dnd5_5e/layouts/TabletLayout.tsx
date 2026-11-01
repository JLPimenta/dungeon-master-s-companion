import { cn } from '@/lib/utils';
import { Column, TabletFrame } from '@/systems/shared/layout/frames';
import { NotesList, CustomFieldsList } from '@/systems/shared/sections/NotesAndFields';
import { ProfileCard } from '@/systems/shared/ui/IdentityGrid';
import { useDndSheet } from '@/systems/dnd-common/v2/context';
import { DndTabletAbilityColumn, DndTabletHeader, useClassSubtitle, useDndIdentity } from '@/systems/dnd-common/v2/Header';
import { SkillsByAbility, SkillsLegend } from '@/systems/dnd-common/v2/Abilities';
import { WeaponsList } from '@/systems/dnd-common/v2/Combat';
import { SpellcastingHeader, SpellSlotsRows, SpellsList } from '@/systems/dnd-common/v2/Spells';
import { AttunedList, CoinsCard, EquipmentList } from '@/systems/dnd-common/v2/Inventory';
import { DndPanels } from '@/systems/dnd-common/v2/Panels';
import { EquipmentTraining, FeaturesList, HistoryCard, IDENTITY_55, SpeciesAndFeats } from '../sections/v2';
import type { Dnd55Sheet } from '../definition';
import { TABLET_NAV, placeFromTablet, tabletTabOf, type SheetPlace } from '@/systems/dnd-common/v2/navigation';

/** Ficha 5.5e no tablet (1024–1279 px) (docs/redesign-v2/03-ficha.md, "Tablet"). */
export function TabletLayout({ place, onPlace }: { place: SheetPlace; onPlace: (p: SheetPlace) => void }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd55Sheet>();
  const identity = useDndIdentity();
  const subtitle = useClassSubtitle('subclass');
  const nav = readOnly ? TABLET_NAV.filter(n => n.id !== 'mochila') : TABLET_NAV;
  const tab = readOnly && tabletTabOf(place) === 'mochila' ? 'sessao' : tabletTabOf(place);

  return (
    <TabletFrame
      title={sheet.name}
      subtitle={subtitle}
      nav={nav}
      active={tab}
      onSelect={id => onPlace(placeFromTablet(id, place))}
      header={<DndTabletHeader />}
      overlays={<DndPanels />}
    >
      {tab === 'sessao' && (
        <div className="grid min-h-0 flex-1 grid-cols-[270px_minmax(0,1fr)_360px]">
          <Column><DndTabletAbilityColumn /></Column>
          <Column className="border-x border-border/30"><WeaponsList /></Column>
          <Column><SpellcastingHeader /><SpellSlotsRows /><SpellsList /></Column>
        </div>
      )}
      {tab === 'pericias' && (
        <Column className="flex-1">
          <SkillsLegend />
          <SkillsByAbility className="grid grid-cols-3 items-start gap-3" />
        </Column>
      )}
      {tab === 'tracos' && (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <Column><FeaturesList /></Column>
          <Column><SpeciesAndFeats /><EquipmentTraining /></Column>
        </div>
      )}
      {tab === 'mochila' && (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <Column><CoinsCard /><AttunedList /></Column>
          <Column><EquipmentList /></Column>
        </div>
      )}
      {tab === 'diario' && (
        <div className={cn('grid min-h-0 flex-1', readOnly ? 'grid-cols-1' : 'grid-cols-3')}>
          <Column>
            <ProfileCard fields={IDENTITY_55} values={identity.values} onChange={identity.onChange} readOnly={readOnly} />
            <HistoryCard />
          </Column>
          {!readOnly && (
            <>
              <Column className="border-x border-border/30">
                <NotesList notes={sheet.campaignNotes} onChange={n => update({ campaignNotes: n })} />
              </Column>
              <Column><CustomFieldsList fields={sheet.customFields} onChange={f => update({ customFields: f })} /></Column>
            </>
          )}
        </div>
      )}
    </TabletFrame>
  );
}
