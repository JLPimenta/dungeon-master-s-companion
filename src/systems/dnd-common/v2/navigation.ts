import { Backpack, BookOpen, ListChecks, Scroll, Sword } from 'lucide-react';
import type { NavItem } from '@/systems/shared/ui/SectionNav';

/*
 * Onde o usuário está na ficha D&D (5.5e e 5e), compartilhado entre celular e tablet para
 * sobreviver à troca de layout (girar o tablet, redimensionar a janela).
 */

export type PhoneTab = 'combate' | 'magias' | 'pericias' | 'tracos' | 'mais';
export type MoreTab = 'perfil' | 'mochila' | 'notas' | 'campos';
export type TabletTab = 'sessao' | 'pericias' | 'tracos' | 'mochila' | 'diario';

export interface SheetPlace {
  phone: PhoneTab;
  more: MoreTab;
}

export const INITIAL_PLACE: SheetPlace = { phone: 'combate', more: 'perfil' };

export const PHONE_NAV: NavItem<PhoneTab>[] = [
  { id: 'combate', label: 'Combate', icon: Sword },
  { id: 'magias', label: 'Magias', icon: BookOpen },
  { id: 'pericias', label: 'Perícias', icon: ListChecks },
  { id: 'tracos', label: 'Traços', icon: Scroll },
  { id: 'mais', label: 'Mais', icon: Backpack },
];

export const TABLET_NAV: NavItem<TabletTab>[] = [
  { id: 'sessao', label: 'Sessão', icon: Sword },
  { id: 'pericias', label: 'Perícias', icon: ListChecks },
  { id: 'tracos', label: 'Traços', icon: Scroll },
  { id: 'mochila', label: 'Mochila', icon: Backpack },
  { id: 'diario', label: 'Diário', icon: BookOpen },
];

export function tabletTabOf(place: SheetPlace): TabletTab {
  switch (place.phone) {
    case 'combate':
    case 'magias':
      return 'sessao';
    case 'pericias':
    case 'tracos':
      return place.phone;
    case 'mais':
      return place.more === 'mochila' ? 'mochila' : 'diario';
  }
}

export function placeFromTablet(tab: TabletTab, current: SheetPlace): SheetPlace {
  switch (tab) {
    case 'sessao':
      return { ...current, phone: current.phone === 'magias' ? 'magias' : 'combate' };
    case 'pericias':
    case 'tracos':
      return { ...current, phone: tab };
    case 'mochila':
      return { phone: 'mais', more: 'mochila' };
    case 'diario':
      return { phone: 'mais', more: current.more === 'mochila' ? 'perfil' : current.more };
  }
}
