import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Column, DesktopFrame, PhoneFrame, Segments, TabletFrame, type SectionLink } from '@/systems/shared/layout/frames';
import { IdentityGrid, ProfileCard } from '@/systems/shared/ui/IdentityGrid';
import { EditToggle, useEditing } from '@/systems/shared/ui/ViewEditBlock';
import { NotesList, CustomFieldsList } from '@/systems/shared/sections/NotesAndFields';
import {
  PHONE_NAV, TABLET_NAV, placeFromTablet, tabletTabOf, type MoreTab, type SheetPlace,
} from '@/systems/dnd-common/v2/navigation';
import { useT20 } from './context';
import { T20Panels } from './Panels';
import {
  IDENTITY_T20, ResourceBlock, T20Abilities, T20Attacks, T20Attributes, T20CombatNumbers, T20CompactVitals, T20Equipment,
  T20InlineVitals, T20Notes, T20Proficiencies, T20Skills, T20SpellHeader, T20SpellsList, T20Story, T20VitalsCard,
  useT20Identity, useT20Subtitle,
} from './sections';

/*
 * Ficha Tormenta20 no redesign v2: mesma casca, mesmas abas e mesma
 * navegação das fichas D&D; a aba "Traços" vira "Poderes".
 */

const PHONE_NAV_T20 = PHONE_NAV.map(n => (n.id === 'tracos' ? { ...n, label: 'Poderes', icon: Sparkles } : n));
const TABLET_NAV_T20 = TABLET_NAV.map(n => (n.id === 'tracos' ? { ...n, label: 'Poderes', icon: Sparkles } : n));

const MORE_TABS: { id: MoreTab; label: string }[] = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'mochila', label: 'Mochila' },
  { id: 'notas', label: 'Notas' },
  { id: 'campos', label: 'Campos' },
];

const LINKS: SectionLink[] = [
  { href: '#topo', label: 'Ficha' },
  { href: '#atributos', label: 'Atributos' },
  { href: '#combate', label: 'Combate' },
  { href: '#ataques', label: 'Ataques' },
  { href: '#poderes', label: 'Poderes' },
  { href: '#magias', label: 'Magias' },
  { href: '#inventario', label: 'Equipamento', private: true },
  { href: '#historia', label: 'Histórico' },
  { href: '#notas', label: 'Notas', private: true },
  { href: '#campos', label: 'Campos', private: true },
];

function CampaignNotes({ grid }: { grid?: boolean }) {
  const { sheet, update, readOnly } = useT20();
  return <NotesList notes={sheet.campaignNotes} onChange={n => update({ campaignNotes: n })} readOnly={readOnly} grid={grid} />;
}

function CustomFields() {
  const { sheet, update, readOnly } = useT20();
  return <CustomFieldsList fields={sheet.customFields} onChange={f => update({ customFields: f })} readOnly={readOnly} />;
}

function Profile() {
  const { readOnly } = useT20();
  const identity = useT20Identity();
  return <ProfileCard fields={IDENTITY_T20} values={identity.values} onChange={identity.onChange} readOnly={readOnly} />;
}

export function T20Phone({ place, onPlace }: { place: SheetPlace; onPlace: (p: SheetPlace) => void }) {
  const { sheet, readOnly } = useT20();
  const subtitle = useT20Subtitle();
  const tab = place.phone;
  const moreTabs = readOnly ? MORE_TABS.filter(t => t.id === 'perfil') : MORE_TABS;
  const more = readOnly ? 'perfil' : place.more;

  return (
    <PhoneFrame
      title={sheet.name}
      subtitle={subtitle}
      nav={PHONE_NAV_T20}
      active={tab}
      onSelect={id => onPlace({ ...place, phone: id })}
      strip={tab !== 'combate' && <T20CompactVitals />}
      scrollKey={`${tab}:${more}`}
      overlays={<T20Panels />}
    >
      {tab === 'combate' && (<><T20VitalsCard /><T20Attributes /><T20Attacks /></>)}
      {tab === 'magias' && (<><T20SpellHeader /><T20SpellsList /></>)}
      {tab === 'pericias' && <T20Skills />}
      {tab === 'tracos' && (<><T20Abilities /><T20Proficiencies /></>)}
      {tab === 'mais' && (
        <>
          <Segments items={moreTabs} active={more} onSelect={id => onPlace({ ...place, more: id })} />
          {more === 'perfil' && (<><Profile /><T20Story /></>)}
          {more === 'mochila' && <T20Equipment />}
          {more === 'notas' && (<><T20Notes /><CampaignNotes /></>)}
          {more === 'campos' && <CustomFields />}
        </>
      )}
    </PhoneFrame>
  );
}

function T20TabletHeader() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div className="w-[210px] shrink-0"><ResourceBlock kind="hp" size="md" /></div>
      <div className="w-[210px] shrink-0"><ResourceBlock kind="mp" size="md" /></div>
      <T20CombatNumbers className="max-w-[420px] flex-1" />
    </div>
  );
}

export function T20Tablet({ place, onPlace }: { place: SheetPlace; onPlace: (p: SheetPlace) => void }) {
  const { sheet, readOnly } = useT20();
  const subtitle = useT20Subtitle();
  const nav = readOnly ? TABLET_NAV_T20.filter(n => n.id !== 'mochila') : TABLET_NAV_T20;
  const tab = readOnly && tabletTabOf(place) === 'mochila' ? 'sessao' : tabletTabOf(place);

  return (
    <TabletFrame
      title={sheet.name}
      subtitle={subtitle}
      nav={nav}
      active={tab}
      onSelect={id => onPlace(placeFromTablet(id, place))}
      header={<T20TabletHeader />}
      overlays={<T20Panels />}
    >
      {tab === 'sessao' && (
        <div className="grid min-h-0 flex-1 grid-cols-[270px_minmax(0,1fr)_360px]">
          <Column><T20Attributes columns={2} /></Column>
          <Column className="border-x border-border/30"><T20Attacks /></Column>
          <Column><T20SpellHeader /><T20SpellsList /></Column>
        </div>
      )}
      {tab === 'pericias' && (
        <Column className="flex-1">
          <T20Skills gridClass="grid grid-cols-2 gap-x-6" />
        </Column>
      )}
      {tab === 'tracos' && (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <Column><T20Abilities /></Column>
          <Column><T20Proficiencies /></Column>
        </div>
      )}
      {tab === 'mochila' && (
        <Column className="flex-1"><T20Equipment /></Column>
      )}
      {tab === 'diario' && (
        <div className={cn('grid min-h-0 flex-1', readOnly ? 'grid-cols-1' : 'grid-cols-3')}>
          <Column><Profile /><T20Story /></Column>
          {!readOnly && (
            <>
              <Column className="border-x border-border/30"><T20Notes /><CampaignNotes /></Column>
              <Column><CustomFields /></Column>
            </>
          )}
        </div>
      )}
    </TabletFrame>
  );
}

function T20HeaderCard() {
  const { readOnly } = useT20();
  const identity = useT20Identity();
  const { isEditing, start, done } = useEditing('identity');
  const editing = isEditing && !readOnly;
  return (
    <section id="topo" className="flex scroll-mt-24 items-start gap-4 rounded-xl border border-hairline bg-card p-4">
      <div className="min-w-0 flex-1">
        <IdentityGrid fields={IDENTITY_T20} values={identity.values} onChange={identity.onChange} columns={10} editing={editing} />
      </div>
      {!readOnly && (
        <div className="shrink-0 pt-1">
          <EditToggle isEditing={editing} onStart={start} onDone={done} label="dados do personagem" />
        </div>
      )}
    </section>
  );
}

/** Computador: ordem da ficha oficial, no padrão de colunas da v1 (340 px | resto). */
export function T20Desktop() {
  const { sheet, readOnly } = useT20();
  const subtitle = useT20Subtitle();

  return (
    <DesktopFrame
      title={sheet.name}
      subtitle={subtitle}
      links={LINKS}
      topbarExtra={<T20InlineVitals className="shrink-0" />}
      overlays={<T20Panels />}
    >
      <T20HeaderCard />

      <div className="grid grid-cols-[340px_minmax(0,1fr)] items-stretch gap-5">
        <div className="flex flex-col gap-5">
          <T20Attributes />
          <T20Skills dense />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <div id="combate" className="scroll-mt-24"><T20VitalsCard title="Combate" /></div>
          <T20Attacks table maxHeightClass="max-h-[340px]" />
          <T20Proficiencies className="flex-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 items-start gap-5">
        <T20Abilities />
      </div>

      <T20SpellsList lead={<T20SpellHeader className="max-w-[520px]" />} />

      {!readOnly && <T20Equipment table />}

      <div className="grid grid-cols-2 items-start gap-5">
        <T20Story />
      </div>
      {!readOnly && <T20Notes />}

      {!readOnly && (
        <>
          <CampaignNotes grid />
          <CustomFields />
        </>
      )}
    </DesktopFrame>
  );
}
