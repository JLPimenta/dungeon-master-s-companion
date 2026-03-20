import type { AbilityKey, CharacterSheet } from '@/types/character';

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyBonus(level: number): number {
  if (level <= 0) return 2;
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

export function getSkillBonus(
  abilityScore: number,
  proficient: boolean,
  expertise: boolean,
  proficiencyBonus: number
): number {
  const mod = getModifier(abilityScore);
  if (expertise) return mod + proficiencyBonus * 2;
  if (proficient) return mod + proficiencyBonus;
  return mod;
}

export function getSpellSaveDC(abilityMod: number, profBonus: number): number {
  return 8 + abilityMod + profBonus;
}

export function getSpellAttackBonus(abilityMod: number, profBonus: number): number {
  return abilityMod + profBonus;
}

export function getPassivePerception(
  wisdomScore: number,
  proficient: boolean,
  proficiencyBonus: number
): number {
  return 10 + getSkillBonus(wisdomScore, proficient, false, proficiencyBonus);
}

export function getAttunementSlots(proficiencyBonus: number): number {
  return proficiencyBonus;
}

export function getInitiativeBonus(sheet: CharacterSheet): number {
  return getModifier(sheet.abilities.dexterity.value);
}

export function getAbilityModifier(sheet: CharacterSheet, ability: AbilityKey): number {
  return getModifier(sheet.abilities[ability].value);
}
