import type { SheetComponentProps } from '../types';
import type { Dnd5eSheet } from './types';
import { SheetShell } from '@/systems/shared/layout/frames';
import { DndSheetProvider } from '@/systems/dnd-common/v2/context';
import { INITIAL_PLACE } from '@/systems/dnd-common/v2/navigation';
import { DND5E_RULES } from './v2/sections';
import { Dnd5eDesktop, Dnd5ePhone, Dnd5eTablet } from './v2/layouts';

/**
 * Ficha D&D 5e (2014) — redesign v2 (docs/redesign-v2/03-ficha.md), na ordem
 * da ficha oficial. Usa a mesma casca e as seções do núcleo D&D da 5.5e; as
 * diferenças de regra ficam em DND5E_RULES ("Inspiração", 3 sintonizados).
 *
 * Somente leitura (link compartilhado): ficam ocultos Inventário, Tesouro,
 * Notas da Campanha e Campos Personalizados — mesmo critério do 5.5e.
 */
export function Dnd5eSheetLayout({ sheet, onChange, onBlur, readOnly = false }: SheetComponentProps<Dnd5eSheet>) {
  return (
    <DndSheetProvider sheet={sheet} onChange={onChange} readOnly={readOnly} rules={DND5E_RULES}>
      <SheetShell
        initialPlace={INITIAL_PLACE}
        onBlur={onBlur}
        readOnly={readOnly}
        phone={(place, setPlace) => <Dnd5ePhone place={place} onPlace={setPlace} />}
        tablet={(place, setPlace) => <Dnd5eTablet place={place} onPlace={setPlace} />}
        desktop={() => <Dnd5eDesktop />}
      />
    </DndSheetProvider>
  );
}
