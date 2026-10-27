import type { T20Attribute, T20Sheet, T20Size, T20SpellCircle } from './types';
import { skillState, type T20SkillDefinition } from './skills';

/*
 * Regras do Tormenta20 (Jogo do Ano) como funções puras.
 * As fórmulas reproduzem as da ficha editável oficial (PDF), que é a
 * referência adotada para este módulo.
 */

export const T20_ATTRIBUTES: { key: T20Attribute; abbr: string; name: string }[] = [
  { key: 'for', abbr: 'FOR', name: 'Força' },
  { key: 'des', abbr: 'DES', name: 'Destreza' },
  { key: 'con', abbr: 'CON', name: 'Constituição' },
  { key: 'int', abbr: 'INT', name: 'Inteligência' },
  { key: 'sab', abbr: 'SAB', name: 'Sabedoria' },
  { key: 'car', abbr: 'CAR', name: 'Carisma' },
];

export const T20_SIZES: { key: T20Size; name: string; stealth: number; maneuver: number }[] = [
  { key: 'minusculo', name: 'Minúsculo', stealth: 5, maneuver: -5 },
  { key: 'pequeno', name: 'Pequeno', stealth: 2, maneuver: -2 },
  { key: 'medio', name: 'Médio', stealth: 0, maneuver: 0 },
  { key: 'grande', name: 'Grande', stealth: -2, maneuver: 2 },
  { key: 'enorme', name: 'Enorme', stealth: -5, maneuver: 5 },
  { key: 'colossal', name: 'Colossal', stealth: -10, maneuver: 10 },
];

/** Custo em PM para lançar uma magia de cada círculo. */
export const SPELL_CIRCLE_COST: Record<T20SpellCircle, number> = { 1: 1, 2: 3, 3: 6, 4: 10, 5: 15 };

/** Máximo de itens vestidos com benefício simultâneo. */
export const MAX_WORN_ITEMS = 4;

const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

export function halfLevel(level: number): number {
  return Math.floor(Math.max(1, n(level)) / 2);
}

/** Bônus de treinamento: +2 (níveis 1–6), +4 (7–14), +6 (15+). */
export function trainingBonus(level: number): number {
  const l = n(level);
  if (l >= 15) return 6;
  if (l >= 7) return 4;
  return 2;
}

export function armorPenaltyTotal(sheet: Pick<T20Sheet, 'armor' | 'shield'>): number {
  return Math.abs(n(sheet.armor?.penalty)) + Math.abs(n(sheet.shield?.penalty));
}

/**
 * Total de uma perícia: ½ nível + treino + atributo + outros − penalidade de
 * armadura (só nas perícias marcadas). Retorna null quando a perícia é
 * "somente treinada" e o personagem não é treinado (ND na ficha).
 */
export function skillTotal(
  sheet: Pick<T20Sheet, 'level' | 'attributes' | 'skills' | 'armor' | 'shield'>,
  def: T20SkillDefinition,
): number | null {
  const state = skillState(sheet.skills, def);
  if (def.trainedOnly && !state.trained) return null;

  const training = state.trained ? trainingBonus(sheet.level) : 0;
  const penalty = def.armorPenalty ? armorPenaltyTotal(sheet) : 0;

  return halfLevel(sheet.level) + training + n(sheet.attributes?.[state.attribute]) + n(state.other) - penalty;
}

/**
 * Defesa = 10 + atributo + armadura + escudo + outros.
 * Com armadura pesada o atributo entra limitado (mínimo 0, máximo o limite
 * informado; com limite 0 ele simplesmente não entra).
 */
export function defenseTotal(sheet: Pick<T20Sheet, 'attributes' | 'defense' | 'armor' | 'shield'>): number {
  const attr = n(sheet.attributes?.[sheet.defense?.attribute ?? 'des']);
  const attrPart = sheet.defense?.heavyArmor
    ? Math.max(0, Math.min(attr, n(sheet.defense.attributeLimit)))
    : attr;
  return 10 + attrPart + n(sheet.armor?.bonus) + n(sheet.shield?.bonus) + n(sheet.defense?.other);
}

/** Espaços de carga: 10 + 2 por ponto de Força (ou −1 por ponto negativo). */
export function carryCapacity(strength: number): number {
  const str = n(strength);
  return str > 0 ? 10 + str * 2 : 10 + str;
}

/** Peso máximo que dá para levantar: o dobro da carga máxima. */
export function liftCapacity(strength: number): number {
  return carryCapacity(strength) * 2;
}

export function currentLoad(sheet: Pick<T20Sheet, 'equipment'>): number {
  const total = (sheet.equipment ?? []).reduce((sum, item) => sum + n(item.spaces), 0);
  return Math.round(total * 10) / 10;
}

export function wornCount(sheet: Pick<T20Sheet, 'equipment'>): number {
  return (sheet.equipment ?? []).filter(i => i.worn).length;
}

export function sizeInfo(size: T20Size | undefined) {
  return T20_SIZES.find(s => s.key === size) ?? T20_SIZES[2];
}

/** CD das magias: 10 + ½ nível + atributo-chave. */
export function spellDC(sheet: Pick<T20Sheet, 'level' | 'attributes' | 'spellcasting'>): number {
  return 10 + halfLevel(sheet.level) + n(sheet.attributes?.[sheet.spellcasting?.attribute ?? 'int']);
}

export function formatBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
