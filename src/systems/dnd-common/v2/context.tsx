import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AbilityKey } from '@/types/character';
import type { DndCoreSheet } from '@/systems/dnd-common/types';
import { ABILITY_ABBR, ABILITY_LABELS } from '@/types/character';
import {
  getAbilityModifier,
  getAttunementSlots,
  getEffectiveProficiencyBonus,
  getHitDiceRemaining,
  getInitiativeBonus,
  getPassivePerception,
  getProficiencyBonus,
  getSavingThrowBonus,
  getSkillBonus,
  getSpellAttackBonus,
  getSpellSaveDC,
  getTotalWeight,
  parseHitDiceCount,
} from '@/utils/calculations';

/*
 * Estado compartilhado pelas seções v2 da família D&D (5.5e e 5e de 2014): a
 * ficha, a função de alteração, o modo somente leitura, os valores calculados
 * (sempre via src/utils/calculations.ts), qual painel está aberto e as
 * diferenças de regra entre as edições (`DndRules`).
 *
 * As seções do núcleo só usam campos de DndCoreSheet. Seções de uma edição
 * pedem o tipo completo: `useDndSheet<Dnd55Sheet>()`.
 */

/** Ficha mínima que as seções do núcleo D&D sabem exibir. */
export type DndSheetLike = DndCoreSheet & { name: string; level: number };

/** Diferenças de regra/rótulo entre as edições. */
export interface DndRules {
  /** "Inspiração Heroica" (5.5e) ou "Inspiração" (5e). */
  inspirationLabel: string;
  /** Limite de itens sintonizados a partir da proficiência efetiva. */
  attunementLimit: (prof: number) => number;
  /** Texto da regra do limite, mostrado sob o título. */
  attunementNote: string;
}

export const DND55_RULES: DndRules = {
  inspirationLabel: 'Inspiração Heroica',
  attunementLimit: prof => getAttunementSlots(prof),
  attunementNote: 'Limite = bônus de proficiência',
};

export const ABILITY_KEYS: AbilityKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
export { ABILITY_ABBR, ABILITY_LABELS };

/** Painel aberto (folha inferior no celular, diálogo no tablet/computador). */
export type PanelRequest =
  | { kind: 'info' }
  | { kind: 'cast' }
  | { kind: 'slots' }
  | { kind: 'initiative' }
  | { kind: 'proficiency' }
  | { kind: 'ability'; key: AbilityKey }
  | { kind: 'skill'; name: string };

export function deriveDnd(sheet: DndSheetLike, rules: DndRules = DND55_RULES) {
  const prof = getEffectiveProficiencyBonus(sheet);
  const mod = (k: AbilityKey) => getAbilityModifier(sheet, k);
  const saveBonus = (k: AbilityKey) => sheet.bonuses?.savingThrows?.[k] ?? 0;
  const save = (k: AbilityKey) =>
    getSavingThrowBonus(sheet.abilities[k].value, sheet.abilities[k].proficient, prof, saveBonus(k));
  const skillBonus = (name: string) => sheet.bonuses?.skills?.[name] ?? 0;
  const skill = (name: string) => {
    const s = sheet.skills.find(x => x.name === name);
    if (!s) return 0;
    return getSkillBonus(sheet.abilities[s.ability].value, s.proficient, s.expertise, prof, skillBonus(name));
  };
  const perception = sheet.skills.find(s => s.name === 'Percepção');
  const passive = getPassivePerception(
    sheet.abilities.wisdom.value, perception?.proficient ?? false, prof, skillBonus('Percepção'),
  );
  const cast = sheet.spellcastingAbility || '';
  const castMod = cast ? mod(cast) : null;
  return {
    prof,
    profBase: getProficiencyBonus(sheet.level),
    mod,
    save,
    saveBonus,
    skill,
    skillBonus,
    initiative: getInitiativeBonus(sheet),
    passive,
    castMod,
    spellDC: castMod === null ? null : getSpellSaveDC(castMod, prof),
    spellAttack: castMod === null ? null : getSpellAttackBonus(castMod, prof),
    attunementLimit: rules.attunementLimit(prof),
    hitDiceTotal: parseHitDiceCount(sheet.hitDice?.total),
    hitDiceRemaining: getHitDiceRemaining(sheet.hitDice?.total, sheet.hitDice?.used ?? 0),
    totalWeight: getTotalWeight(sheet.inventory),
  };
}

export type DndDerived = ReturnType<typeof deriveDnd>;

interface DndSheetState<T extends DndSheetLike = DndSheetLike> {
  sheet: T;
  update: (patch: Partial<T>) => void;
  readOnly: boolean;
  d: DndDerived;
  rules: DndRules;
  panel: PanelRequest | null;
  openPanel: (p: PanelRequest) => void;
  closePanel: () => void;
}

const DndSheetContext = createContext<DndSheetState | null>(null);

export function DndSheetProvider<T extends DndSheetLike>({ sheet, onChange, readOnly, rules = DND55_RULES, children }: {
  sheet: T;
  onChange: (patch: Partial<T>) => void;
  readOnly: boolean;
  rules?: DndRules;
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<PanelRequest | null>(null);
  const d = useMemo(() => deriveDnd(sheet, rules), [sheet, rules]);
  const value: DndSheetState<T> = {
    sheet,
    update: readOnly ? () => {} : onChange,
    readOnly,
    d,
    rules,
    panel,
    openPanel: setPanel,
    closePanel: () => setPanel(null),
  };
  return <DndSheetContext.Provider value={value as unknown as DndSheetState}>{children}</DndSheetContext.Provider>;
}

/** Estado da ficha. Seções de uma edição informam o tipo: `useDndSheet<Dnd55Sheet>()`. */
// eslint-disable-next-line react-refresh/only-export-components
export function useDndSheet<T extends DndSheetLike = DndSheetLike>(): DndSheetState<T> {
  const ctx = useContext(DndSheetContext);
  if (!ctx) throw new Error('useDndSheet precisa de <DndSheetProvider>.');
  return ctx as unknown as DndSheetState<T>;
}

/** "+3" / "−1" com sinal de menos tipográfico. */
// eslint-disable-next-line react-refresh/only-export-components
export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return n >= 0 ? `+${n}` : `−${Math.abs(n)}`;
}
