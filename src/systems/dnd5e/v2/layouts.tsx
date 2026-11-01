import { cn } from '@/lib/utils';
import { Column, DesktopFrame, PhoneFrame, Segments, TabletFrame, type SectionLink } from '@/systems/shared/layout/frames';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { ProfileCard } from '@/systems/shared/ui/IdentityGrid';
import { NotesList, CustomFieldsList } from '@/systems/shared/sections/NotesAndFields';
import { useDndSheet } from '@/systems/dnd-common/v2/context';
import {
  CompactVitals, DndHeaderCard, DndTabletAbilityColumn, DndTabletHeader, InlineAc, InlineHp, useClassSubtitle, useDndIdentity,
} from '@/systems/dnd-common/v2/Header';
import { VitalsCard } from '@/systems/dnd-common/v2/Vitals';
import { AbilityGrid, AbilityRows, SkillsByAbility, SkillsFlat, SkillsLegend } from '@/systems/dnd-common/v2/Abilities';
import { WeaponsList } from '@/systems/dnd-common/v2/Combat';
import { DndDesktopSpellcasting, SpellcastingHeader, SpellSlotsRows, SpellsList } from '@/systems/dnd-common/v2/Spells';
import { AttunedList, CoinsCard, EquipmentList } from '@/systems/dnd-common/v2/Inventory';
import { DndPanels } from '@/systems/dnd-common/v2/Panels';
import {
  PHONE_NAV, TABLET_NAV, placeFromTablet, tabletTabOf, type MoreTab, type SheetPlace,
} from '@/systems/dnd-common/v2/navigation';
import type { Dnd5eSheet } from '../types';
import {
  CharacterDescriptionCard, DESKTOP_IDENTITY_5E, FeaturesCard, IDENTITY_5E, LongTexts, PersonalityCard, ProficienciesCard,
  TreasureCard,
} from './sections';

/*
 * Ficha D&D 5e (2014) no redesign v2: mesma casca e mesmas abas da 5.5e,
 * com as seções da ficha oficial de 2014.
 */

const MORE_TABS: { id: MoreTab; label: string }[] = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'mochila', label: 'Mochila' },
  { id: 'notas', label: 'Notas' },
  { id: 'campos', label: 'Campos' },
];

const LINKS: SectionLink[] = [
  { href: '#topo', label: 'Ficha' },
  { href: '#atributos', label: 'Atributos' },
  { href: '#armas', label: 'Armas' },
  { href: '#personalidade', label: 'Personalidade' },
  { href: '#magias', label: 'Magias' },
  { href: '#inventario', label: 'Inventário', private: true },
  { href: '#tracos', label: 'Características' },
  { href: '#descricao', label: 'Descrição' },
  { href: '#notas', label: 'Notas', private: true },
  { href: '#campos', label: 'Campos', private: true },
];

export function Dnd5ePhone({ place, onPlace }: { place: SheetPlace; onPlace: (p: SheetPlace) => void }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  const identity = useDndIdentity();
  const subtitle = useClassSubtitle('race');
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
      {tab === 'pericias' && (<><SkillsLegend /><SkillsByAbility /><ProficienciesCard /></>)}
      {tab === 'tracos' && (<><FeaturesCard /><PersonalityCard /></>)}
      {tab === 'mais' && (
        <>
          <Segments items={moreTabs} active={more} onSelect={id => onPlace({ ...place, more: id })} />
          {more === 'perfil' && (
            <>
              <ProfileCard fields={IDENTITY_5E} values={identity.values} onChange={identity.onChange} readOnly={readOnly} />
              <CharacterDescriptionCard />
              <LongTexts />
            </>
          )}
          {more === 'mochila' && (<><CoinsCard /><AttunedList /><EquipmentList /><TreasureCard /></>)}
          {more === 'notas' && <NotesList notes={sheet.campaignNotes} onChange={n => update({ campaignNotes: n })} readOnly={readOnly} />}
          {more === 'campos' && <CustomFieldsList fields={sheet.customFields} onChange={f => update({ customFields: f })} readOnly={readOnly} />}
        </>
      )}
    </PhoneFrame>
  );
}

export function Dnd5eTablet({ place, onPlace }: { place: SheetPlace; onPlace: (p: SheetPlace) => void }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  const identity = useDndIdentity();
  const subtitle = useClassSubtitle('race');
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
          <ProficienciesCard />
        </Column>
      )}
      {tab === 'tracos' && (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <Column><FeaturesCard /></Column>
          <Column><PersonalityCard /></Column>
        </div>
      )}
      {tab === 'mochila' && (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <Column><CoinsCard /><AttunedList /><TreasureCard /></Column>
          <Column><EquipmentList /></Column>
        </div>
      )}
      {tab === 'diario' && (
        <div className={cn('grid min-h-0 flex-1', readOnly ? 'grid-cols-1' : 'grid-cols-3')}>
          <Column>
            <ProfileCard fields={IDENTITY_5E} values={identity.values} onChange={identity.onChange} readOnly={readOnly} />
            <CharacterDescriptionCard />
            <LongTexts />
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

/** Computador: ordem da ficha oficial, no padrão de colunas da v1. */
export function Dnd5eDesktop() {
  const { sheet, update, readOnly } = useDndSheet<Dnd5eSheet>();
  const subtitle = useClassSubtitle('race');

  return (
    <DesktopFrame
      title={sheet.name}
      subtitle={subtitle}
      links={LINKS}
      topbarExtra={<><InlineHp className="shrink-0" /><InlineAc /></>}
      overlays={<DndPanels />}
    >
      <DndHeaderCard fields={DESKTOP_IDENTITY_5E} columns={9} />

      <div className="grid grid-cols-[300px_minmax(0,1fr)] items-stretch gap-5">
        <div className="flex flex-col gap-5">
          <AbilityRows />
          <SkillsFlat />
          <ProficienciesCard />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <VitalsCard title="Informações gerais" />
          <WeaponsList table maxHeightClass="max-h-[300px]" />
          <PersonalityCard columns={2} className="flex-1" />
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
          <TreasureCard />
        </SheetCard>
      )}

      <FeaturesCard />

      <section id="descricao" className="flex scroll-mt-24 flex-col gap-5">
        <CharacterDescriptionCard wide />
        <div className="grid grid-cols-3 items-start gap-5">
          <LongTexts />
        </div>
      </section>

      {!readOnly && (
        <>
          <NotesList notes={sheet.campaignNotes} onChange={n => update({ campaignNotes: n })} grid />
          <CustomFieldsList fields={sheet.customFields} onChange={f => update({ customFields: f })} />
        </>
      )}
    </DesktopFrame>
  );
}
