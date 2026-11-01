import type { SheetComponentProps } from '../types';
import type { Dnd55Sheet } from './definition';
import { SheetShell } from '@/systems/shared/layout/frames';
import { DND55_RULES, DndSheetProvider } from '@/systems/dnd-common/v2/context';
import { PhoneLayout } from './layouts/PhoneLayout';
import { TabletLayout } from './layouts/TabletLayout';
import { DesktopLayout } from './layouts/DesktopLayout';
import { INITIAL_PLACE } from '@/systems/dnd-common/v2/navigation';

/**
 * Layout da ficha D&D 5.5e — redesign v2 (docs/redesign-v2/03-ficha.md).
 *
 * Um layout por vez, escolhido pelo tamanho da tela: celular (< 1024 px,
 * abas), tablet (1024–1279 px, trilho + colunas) ou computador (≥ 1280 px,
 * página única no padrão da v1). A aba atual sobrevive à troca de layout.
 *
 * O sistema declara `ownsChrome`: este layout desenha a barra superior e a
 * barra "deseja salvá-las?" a partir de `useSheetChrome()`; salvar,
 * compartilhar e tela cheia continuam em src/pages/CharacterSheet.tsx.
 *
 * Somente leitura (link compartilhado): nada editável; Inventário, Notas e
 * Campos Personalizados ficam ocultos, como na v1.
 */
export function Dnd55SheetLayout({ sheet, onChange, onBlur, readOnly = false }: SheetComponentProps<Dnd55Sheet>) {
  return (
    <DndSheetProvider sheet={sheet} onChange={onChange} readOnly={readOnly} rules={DND55_RULES}>
      <SheetShell
        initialPlace={INITIAL_PLACE}
        onBlur={onBlur}
        readOnly={readOnly}
        phone={(place, setPlace) => <PhoneLayout place={place} onPlace={setPlace} />}
        tablet={(place, setPlace) => <TabletLayout place={place} onPlace={setPlace} />}
        desktop={() => <DesktopLayout />}
      />
    </DndSheetProvider>
  );
}
