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
export function getEffectiveProficiencyBonus(sheet: CharacterSheet): number {
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
export function getInitiativeBonus(sheet: CharacterSheet): number {
  return getModifier(sheet.abilities.dexterity.value) + (sheet.bonuses?.initiative ?? 0);
}

export function getAbilityModifier(sheet: CharacterSheet, ability: AbilityKey): number {
  return getModifier(sheet.abilities[ability].value);
}