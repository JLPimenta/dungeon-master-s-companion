import type { AbilityKey, CharacterSheet } from '@/types/character';

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Bônus de proficiência base calculado pelo nível (sem bônus externos). */
export function getProficiencyBonus(level: number): number {
  if (level <= 0) return 2;
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

/**
 * Bônus de proficiência efetivo: base do nível + bônus manual do jogador.
 * Use este em todos os cálculos que dependem de proficiência
 * (perícias, salvaguardas, magias, sintonização).
 */
export function getEffectiveProficiencyBonus(sheet: Pick<CharacterSheet, 'level' | 'bonuses'>): number {
  return getProficiencyBonus(sheet.level) + (sheet.bonuses?.proficiencyBonus ?? 0);
}

/**
 * Bônus final de perícia.
 * extraBonus: bônus manual do jogador para esta perícia específica.
 */
export function getSkillBonus(
    abilityScore: number,
    proficient: boolean,
    expertise: boolean,
    proficiencyBonus: number,
    extraBonus: number = 0,
): number {
  const mod = getModifier(abilityScore);
  if (expertise) return mod + proficiencyBonus * 2 + extraBonus;
  if (proficient) return mod + proficiencyBonus + extraBonus;
  return mod + extraBonus;
}

/**
 * Bônus final de salvaguarda para um atributo.
 * extraBonus: bônus manual para esta salvaguarda específica (ex: Manto da Proteção).
 */
export function getSavingThrowBonus(
    abilityScore: number,
    proficient: boolean,
    proficiencyBonus: number,
    extraBonus: number = 0,
): number {
  const mod = getModifier(abilityScore);
  return mod + (proficient ? proficiencyBonus : 0) + extraBonus;
}

export function getSpellSaveDC(abilityMod: number, profBonus: number): number {
  return 8 + abilityMod + profBonus;
}

export function getSpellAttackBonus(abilityMod: number, profBonus: number): number {
  return abilityMod + profBonus;
}

/**
 * Percepção passiva. Usa o bônus de perícia de Percepção já calculado.
 * extraBonus: bônus manual de Percepção, se houver.
 */
export function getPassivePerception(
    wisdomScore: number,
    proficient: boolean,
    proficiencyBonus: number,
    extraBonus: number = 0,
): number {
  return 10 + getSkillBonus(wisdomScore, proficient, false, proficiencyBonus, extraBonus);
}

export function getAttunementSlots(proficiencyBonus: number): number {
  return proficiencyBonus;
}

/**
 * Iniciativa efetiva: modificador de Destreza + bônus manual do jogador.
 * O bônus cobre casos como o Antecedente "Criminoso" (adiciona proficiência à iniciativa).
 */
export function getInitiativeBonus(sheet: Pick<CharacterSheet, 'abilities' | 'bonuses'>): number {
  return getModifier(sheet.abilities.dexterity.value) + (sheet.bonuses?.initiative ?? 0);
}

export function getAbilityModifier(sheet: Pick<CharacterSheet, 'abilities'>, ability: AbilityKey): number {
  return getModifier(sheet.abilities[ability].value);
}

/**
 * Quantidade de dados de vida a partir do texto livre do campo "Dado de Vida (total)".
 * Lê o número antes do "d": "11d8" → 11, "3d10 + 2d8" → 5 (soma os grupos), "d8" → 1.
 * Texto sem dado reconhecível: tenta um número puro ("12" → 12); senão 0.
 */
export function parseHitDiceCount(total: string | null | undefined): number {
  const text = (total ?? '').toLowerCase();
  const groups = [...text.matchAll(/(\d*)\s*d\s*\d+/g)];
  if (groups.length > 0) {
    return groups.reduce((sum, m) => sum + (m[1] ? parseInt(m[1], 10) : 1), 0);
  }
  const plain = text.match(/^\s*(\d+)\s*$/);
  return plain ? parseInt(plain[1], 10) : 0;
}

/** Dados de vida ainda disponíveis (nunca negativo). */
export function getHitDiceRemaining(total: string | null | undefined, used: number): number {
  return Math.max(0, parseHitDiceCount(total) - Math.max(0, used || 0));
}

/** Peso total do equipamento (peso × quantidade), arredondado a 1 casa decimal. */
export function getTotalWeight(items: { weight: number; quantity: number }[] | null | undefined): number {
  const total = (items ?? []).reduce((sum, it) => sum + (Number(it.weight) || 0) * (Number(it.quantity) || 0), 0);
  return Math.round(total * 10) / 10;
}