import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SheetTopBar, BackButton } from '@/systems/shared/chrome/SheetTopBar';
import { UnsavedChangesFloat } from '@/systems/shared/chrome/UnsavedChangesFloat';
import { ReadOnlyBanner } from '@/systems/shared/chrome/ReadOnlyBanner';
import { SaveStatus } from '@/systems/shared/chrome/SaveStatus';
import { useSheetChrome } from '@/systems/shared/chrome/SheetChromeContext';
import { BottomNav, SideRail, type NavItem } from '@/systems/shared/ui/SectionNav';
import { SCROLL_REVEAL_CLASS, useScrollbarReveal } from '@/systems/shared/ui/useScrollbarReveal';
import { EditingProvider, useCloseEditing } from '@/systems/shared/ui/ViewEditBlock';
import { useBreakpoint } from '@/systems/shared/ui/useBreakpoint';

/*
 * Casca dos layouts do redesign v2, comum a todos os sistemas
 * (docs/redesign-v2/03-ficha.md). Cada sistema só decide O QUE vai em cada
 * aba/coluna; a barra superior, a navegação, a rolagem, o banner de somente
 * leitura e a barra "deseja salvá-las?" são iguais para todos.
 */

/** Escolhe o layout pelo tamanho da tela, guarda a posição e liga o salvamento no blur. */
export function SheetShell<P>({ initialPlace, onBlur, readOnly, phone, tablet, desktop }: {
  initialPlace: P;
  onBlur?: () => void;
  readOnly?: boolean;
  phone: (place: P, setPlace: (p: P) => void) => ReactNode;
  tablet: (place: P, setPlace: (p: P) => void) => ReactNode;
  desktop: () => ReactNode;
}) {
  const bp = useBreakpoint();
  const [place, setPlace] = useState<P>(initialPlace);
  return (
    <EditingProvider>
      {/* O blur dos campos sobe até aqui (inclusive dos painéis, que são portais React) e dispara o salvamento da página. */}
      <div onBlur={readOnly ? undefined : onBlur}>
        {bp === 'phone' && phone(place, setPlace)}
        {bp === 'tablet' && tablet(place, setPlace)}
        {bp === 'desktop' && desktop()}
      </div>
    </EditingProvider>
  );
}

/** Segmentos de uma aba (ex.: Mais › Perfil · Mochila · Notas · Campos). */
export function Segments<Id extends string>({ items, active, onSelect, label = 'Seção' }: {
  items: { id: Id; label: string }[];
  active: Id;
  onSelect: (id: Id) => void;
  label?: string;
}) {
  if (items.length < 2) return null;
  return (
    <div role="group" aria-label={label} className="grid overflow-hidden rounded-lg border border-hairline"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(t => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(t.id)}
            className={cn('h-11 text-[15px] transition-colors', on ? 'bg-primary/15 text-primary-text' : 'text-muted-foreground')}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

interface PhoneFrameProps<Id extends string> {
  title: string;
  subtitle?: string;
  nav: NavItem<Id>[];
  active: Id;
  onSelect: (id: Id) => void;
  /** Faixa compacta sob a barra superior (vitais), quando fizer sentido. */
  strip?: ReactNode;
  /** Muda quando o conteúdo troca (aba, segmento): a rolagem volta ao topo. */
  scrollKey: string;
  children: ReactNode;
  /** Painéis e outras camadas. */
  overlays?: ReactNode;
}

/** Celular (< 1024 px): barra superior, conteúdo da aba e navegação inferior. */
export function PhoneFrame<Id extends string>({
  title, subtitle, nav, active, onSelect, strip, scrollKey, children, overlays,
}: PhoneFrameProps<Id>) {
  const { readOnly } = useSheetChrome();
  const reveal = useScrollbarReveal();
  const closeEditing = useCloseEditing();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scroller.current) scroller.current.scrollTop = 0; }, [scrollKey]);

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <SheetTopBar title={title || 'Sem nome'} subtitle={subtitle} back="arrow" />
      {strip}
      <div ref={scroller} onScroll={reveal} className={cn(SCROLL_REVEAL_CLASS, 'min-h-0 flex-1 overflow-y-auto')}>
        <div className="mx-auto flex max-w-[640px] flex-col gap-3 p-3 pb-32">
          {readOnly && <ReadOnlyBanner name={title} />}
          {children}
        </div>
      </div>
      <BottomNav items={nav} active={active} onSelect={id => { closeEditing(); onSelect(id); }} />
      <UnsavedChangesFloat aboveNav />
      {overlays}
    </div>
  );
}

/** Coluna do tablet que rola sozinha. */
export function Column({ children, className }: { children: ReactNode; className?: string }) {
  const reveal = useScrollbarReveal();
  return (
    <div onScroll={reveal} className={cn(SCROLL_REVEAL_CLASS, 'flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto p-3 pb-24', className)}>
      {children}
    </div>
  );
}

interface TabletFrameProps<Id extends string> {
  title: string;
  subtitle?: string;
  nav: NavItem<Id>[];
  active: Id;
  onSelect: (id: Id) => void;
  /** Vitais no cabeçalho. */
  header?: ReactNode;
  children: ReactNode;
  overlays?: ReactNode;
}

/** Tablet (1024–1279 px): trilho lateral, cabeçalho com vitais e colunas. */
export function TabletFrame<Id extends string>({
  title, subtitle, nav, active, onSelect, header, children, overlays,
}: TabletFrameProps<Id>) {
  const { readOnly } = useSheetChrome();
  const closeEditing = useCloseEditing();
  return (
    <div className="flex h-[100dvh] bg-background text-foreground">
      <SideRail
        items={nav}
        active={active}
        onSelect={id => { closeEditing(); onSelect(id); }}
        top={<BackButton variant="mark" />}
        bottom={<SaveStatus className="flex-col gap-1 whitespace-normal text-xs" />}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <SheetTopBar title={title || 'Sem nome'} subtitle={subtitle} back="none" bordered showStatus={false}
          innerClassName="h-auto min-h-[72px] gap-4 px-4 py-2">
          {header}
        </SheetTopBar>
        {readOnly && <ReadOnlyBanner name={title} className="mx-3 mt-3" />}
        {children}
      </div>
      <UnsavedChangesFloat />
      {overlays}
    </div>
  );
}

/** Atalho de seção do computador; `private` some no somente leitura. */
export interface SectionLink {
  href: string;
  label: string;
  private?: boolean;
}

function SectionLinks({ links }: { links: SectionLink[] }) {
  const { readOnly } = useSheetChrome();
  return (
    <nav aria-label="Ir para seção" className="scrollbar-none ml-3 flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
      {links.filter(l => !(readOnly && l.private)).map(l => (
        <a
          key={l.href}
          href={l.href}
          onClick={e => {
            e.preventDefault();
            document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="flex h-10 items-center whitespace-nowrap rounded-md px-2.5 text-[15px] text-muted-foreground hover:bg-primary/10 hover:text-foreground"
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}

/** Computador (≥ 1280 px): página única no padrão da v1, barra superior fixa com atalhos. */
export function DesktopFrame({ title, subtitle, links, topbarExtra, children, overlays }: {
  title: string;
  subtitle?: string;
  links: SectionLink[];
  /** Vitais compactos à direita dos atalhos. */
  topbarExtra?: ReactNode;
  children: ReactNode;
  overlays?: ReactNode;
}) {
  const { readOnly } = useSheetChrome();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SheetTopBar title={title || 'Sem nome'} subtitle={subtitle} back="mark" bordered className="sticky top-0"
        innerClassName="mx-auto h-16 max-w-[1200px] gap-3 px-6">
        <SectionLinks links={links} />
        {topbarExtra}
      </SheetTopBar>
      <main className="mx-auto flex max-w-[1152px] flex-col gap-5 px-6 pb-24 pt-5">
        {readOnly && <ReadOnlyBanner name={title} />}
        {children}
      </main>
      <UnsavedChangesFloat />
      {overlays}
    </div>
  );
}
