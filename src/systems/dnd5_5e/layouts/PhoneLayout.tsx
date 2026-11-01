import { PhoneFrame, Segments } from '@/systems/shared/layout/frames';
import { NotesList, CustomFieldsList } from '@/systems/shared/sections/NotesAndFields';
import { ProfileCard } from '@/systems/shared/ui/IdentityGrid';
import { useDndSheet } from '@/systems/dnd-common/v2/context';
import { CompactVitals, useClassSubtitle, useDndIdentity } from '@/systems/dnd-common/v2/Header';
import { VitalsCard } from '@/systems/dnd-common/v2/Vitals';
import { AbilityGrid, SkillsByAbility, SkillsLegend } from '@/systems/dnd-common/v2/Abilities';
import { WeaponsList } from '@/systems/dnd-common/v2/Combat';
import { SpellcastingHeader, SpellSlotsRows, SpellsList } from '@/systems/dnd-common/v2/Spells';
import { AttunedList, CoinsCard, EquipmentList } from '@/systems/dnd-common/v2/Inventory';
import { DndPanels } from '@/systems/dnd-common/v2/Panels';
import { EquipmentTraining, FeaturesList, HistoryCard, IDENTITY_55, SpeciesAndFeats } from '../sections/v2';
import type { Dnd55Sheet } from '../definition';
import { PHONE_NAV, type MoreTab, type SheetPlace } from '@/systems/dnd-common/v2/navigation';

const MORE_TABS: { id: MoreTab; label: string }[] = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'mochila', label: 'Mochila' },
  { id: 'notas', label: 'Notas' },
  { id: 'campos', label: 'Campos' },
];

/** Ficha 5.5e no celular (< 1024 px), 5 abas (docs/redesign-v2/03-ficha.md, "Celular"). */
export function PhoneLayout({ place, onPlace }: { place: SheetPlace; onPlace: (p: SheetPlace) => void }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd55Sheet>();
  const identity = useDndIdentity();
  const subtitle = useClassSubtitle('subclass');
  const tab = place.phone;
  const moreTabs = readOnly ? MORE_TABS.filter(t => t.id === 'perfil') : MORE_TABS;
  const more = readOnly ? 'perfil' : place.more;

  return (
    <PhoneFrame
      title={sheet.name}
      subtitle={subtitle}
      nav={PHONE_NAV}
      active={tab}
      onSelect={id => onPlace({ ...place, phone: id })}
      strip={tab !== 'combate' && <CompactVitals />}
      scrollKey={`${tab}:${more}`}
      overlays={<DndPanels />}
    >
      {tab === 'combate' && (<><VitalsCard /><AbilityGrid /><WeaponsList /></>)}
      {tab === 'magias' && (<><SpellcastingHeader /><SpellSlotsRows /><SpellsList /></>)}
      {tab === 'pericias' && (<><SkillsLegend /><SkillsByAbility /></>)}
      {tab === 'tracos' && (<><FeaturesList /><SpeciesAndFeats /><EquipmentTraining /></>)}
      {tab === 'mais' && (
        <>
          <Segments items={moreTabs} active={more} onSelect={id => onPlace({ ...place, more: id })} />
          {more === 'perfil' && (
            <>
              <ProfileCard fields={IDENTITY_55} values={identity.values} onChange={identity.onChange} readOnly={readOnly} />
              <HistoryCard />
            </>
          )}
          {more === 'mochila' && (<><CoinsCard /><AttunedList /><EquipmentList /></>)}
          {more === 'notas' && <NotesList notes={sheet.campaignNotes} onChange={n => update({ campaignNotes: n })} readOnly={readOnly} />}
          {more === 'campos' && <CustomFieldsList fields={sheet.customFields} onChange={f => update({ customFields: f })} readOnly={readOnly} />}
        </>
      )}
    </PhoneFrame>
  );
}
