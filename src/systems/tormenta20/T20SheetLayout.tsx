import type { SheetComponentProps } from '../types';
import type { T20Sheet } from './types';
import { SheetShell } from '@/systems/shared/layout/frames';
import { INITIAL_PLACE } from '@/systems/dnd-common/v2/navigation';
import { T20Provider } from './v2/context';
import { T20Desktop, T20Phone, T20Tablet } from './v2/layouts';

/**
 * Ficha Tormenta20 — redesign v2 (docs/redesign-v2/03-ficha.md).
 *
 * Mesma casca das fichas D&D: celular (< 1024 px, abas), tablet
 * (1024–1279 px, trilho + colunas) e computador (≥ 1280 px, página única na
 * ordem da ficha oficial, como na v1).
 *
 * Somente leitura (link compartilhado): nada editável; Equipamento,
 * Anotações, Notas da campanha e Campos personalizáveis ficam ocultos.
 */
export function T20SheetLayout({ sheet, onChange, onBlur, readOnly = false }: SheetComponentProps<T20Sheet>) {
  return (
    <T20Provider sheet={sheet} onChange={onChange} readOnly={readOnly}>
      <SheetShell
        initialPlace={INITIAL_PLACE}
        onBlur={onBlur}
        readOnly={readOnly}
        phone={(place, setPlace) => <T20Phone place={place} onPlace={setPlace} />}
        tablet={(place, setPlace) => <T20Tablet place={place} onPlace={setPlace} />}
        desktop={() => <T20Desktop />}
      />
    </T20Provider>
  );
}
