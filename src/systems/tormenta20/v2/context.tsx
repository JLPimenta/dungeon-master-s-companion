import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { T20Attribute, T20Sheet } from '../types';
import { skillState, T20_SKILLS, type T20SkillDefinition } from '../skills';
import {
  armorPenaltyTotal, carryCapacity, currentLoad, defenseTotal, halfLevel, liftCapacity, sizeInfo, skillTotal, spellDC,
  trainingBonus, wornCount,
} from '../rules';

/*
 * Estado das seções v2 do Tormenta20: ficha, alteração, somente leitura,
 * valores calculados (sempre pelas funções de ../rules.ts) e painel aberto.
 */

export type T20Panel =
  | { kind: 'attribute'; key: T20Attribute }
  | { kind: 'defense' }
  | { kind: 'info' }
  | { kind: 'skill'; key: string }
  | { kind: 'castAttr' };

export function deriveT20(sheet: T20Sheet) {
  const strength = sheet.attributes?.for ?? 0;
  return {
    defense: defenseTotal(sheet),
    penalty: armorPenaltyTotal(sheet),
    half: halfLevel(sheet.level),
    training: trainingBonus(sheet.level),
    skill: (def: T20SkillDefinition) => skillTotal(sheet, def),
    skillState: (def: T20SkillDefinition) => skillState(sheet.skills, def),
    spellDC: spellDC(sheet),
    castAttr: (sheet.spellcasting?.attribute ?? 'int') as T20Attribute,
    load: currentLoad(sheet),
    carry: carryCapacity(strength),
    lift: liftCapacity(strength),
    worn: wornCount(sheet),
    size: sizeInfo(sheet.size),
  };
}

export type T20Derived = ReturnType<typeof deriveT20>;

interface T20State {
  sheet: T20Sheet;
  update: (patch: Partial<T20Sheet>) => void;
  readOnly: boolean;
  d: T20Derived;
  panel: T20Panel | null;
  openPanel: (p: T20Panel) => void;
  closePanel: () => void;
}

const T20Context = createContext<T20State | null>(null);

export function T20Provider({ sheet, onChange, readOnly, children }: {
  sheet: T20Sheet;
  onChange: (patch: Partial<T20Sheet>) => void;
  readOnly: boolean;
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<T20Panel | null>(null);
  const d = useMemo(() => deriveT20(sheet), [sheet]);
  return (
    <T20Context.Provider value={{
      sheet, update: readOnly ? () => {} : onChange, readOnly, d, panel, openPanel: setPanel, closePanel: () => setPanel(null),
    }}>
      {children}
    </T20Context.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useT20(): T20State {
  const ctx = useContext(T20Context);
  if (!ctx) throw new Error('useT20 precisa de <T20Provider>.');
  return ctx;
}

export { T20_SKILLS };
