import { describe, it, expect } from 'vitest';
import {
  getModifier,
  formatModifier,
  getProficiencyBonus,
  getSkillBonus,
  getSavingThrowBonus,
  getSpellSaveDC,
  getSpellAttackBonus,
  getPassivePerception,
  getAttunementSlots,
} from './calculations';

describe('getModifier', () => {
  it.each([
    [1, -5], [2, -4], [3, -4], [4, -3], [5, -3],
    [6, -2], [7, -2], [8, -1], [9, -1], [10, 0],
    [11, 0], [12, 1], [13, 1], [14, 2], [15, 2],
    [16, 3], [17, 3], [18, 4], [19, 4], [20, 5],
    [21, 5], [22, 6], [24, 7], [26, 8], [28, 9], [30, 10],
  ])('score %i → modifier %i', (score, expected) => {
    expect(getModifier(score)).toBe(expected);
  });
});

describe('formatModifier', () => {
  it('formats positive modifiers with +', () => {
    expect(formatModifier(3)).toBe('+3');
  });

  it('formats zero with +', () => {
    expect(formatModifier(0)).toBe('+0');
  });

  it('formats negative modifiers with -', () => {
    expect(formatModifier(-2)).toBe('-2');
  });
});

describe('getProficiencyBonus', () => {
  it.each([
    [0, 2],   // edge: level ≤ 0 defaults to 2
    [1, 2], [4, 2],
    [5, 3], [8, 3],
    [9, 4], [12, 4],
    [13, 5], [16, 5],
    [17, 6], [20, 6],
  ])('level %i → +%i', (level, expected) => {
    expect(getProficiencyBonus(level)).toBe(expected);
  });
});

describe('getSkillBonus', () => {
  // abilityScore 14 → modifier +2

  it('returns only ability modifier when not proficient', () => {
    expect(getSkillBonus(14, false, false, 3)).toBe(2);
  });

  it('adds proficiency bonus when proficient', () => {
    expect(getSkillBonus(14, true, false, 3)).toBe(5); // 2 + 3
  });

  it('doubles proficiency bonus with expertise', () => {
    expect(getSkillBonus(14, true, true, 3)).toBe(8); // 2 + 6
  });

  it('adds extra bonus on top', () => {
    expect(getSkillBonus(14, true, false, 3, 2)).toBe(7); // 2 + 3 + 2
  });

  it('adds extra bonus without proficiency', () => {
    expect(getSkillBonus(10, false, false, 2, 1)).toBe(1); // 0 + 1
  });

  it('expertise with extra bonus', () => {
    expect(getSkillBonus(14, true, true, 2, 1)).toBe(7); // 2 + 4 + 1
  });

  it('handles low ability score (8 → -1)', () => {
    expect(getSkillBonus(8, true, false, 2)).toBe(1); // -1 + 2
  });
});

describe('getSavingThrowBonus', () => {
  it('returns just modifier when not proficient', () => {
    expect(getSavingThrowBonus(14, false, 3)).toBe(2);
  });

  it('adds proficiency when proficient', () => {
    expect(getSavingThrowBonus(14, true, 3)).toBe(5); // 2 + 3
  });

  it('adds extra bonus', () => {
    expect(getSavingThrowBonus(14, true, 3, 1)).toBe(6); // 2 + 3 + 1
  });

  it('extra bonus works without proficiency', () => {
    expect(getSavingThrowBonus(10, false, 2, 2)).toBe(2); // 0 + 0 + 2
  });
});

describe('getSpellSaveDC', () => {
  it('calculates 8 + abilityMod + profBonus', () => {
    expect(getSpellSaveDC(3, 2)).toBe(13); // 8 + 3 + 2
  });

  it('handles negative modifier', () => {
    expect(getSpellSaveDC(-1, 2)).toBe(9); // 8 + (-1) + 2
  });
});

describe('getSpellAttackBonus', () => {
  it('calculates abilityMod + profBonus', () => {
    expect(getSpellAttackBonus(3, 2)).toBe(5);
  });

  it('handles negative modifier', () => {
    expect(getSpellAttackBonus(-1, 2)).toBe(1);
  });
});

describe('getPassivePerception', () => {
  // wisdom 14 → mod +2

  it('calculates 10 + perception skill bonus', () => {
    expect(getPassivePerception(14, false, 2)).toBe(12); // 10 + 2
  });

  it('includes proficiency when proficient', () => {
    expect(getPassivePerception(14, true, 2)).toBe(14); // 10 + 2 + 2
  });

  it('includes extra bonus', () => {
    expect(getPassivePerception(14, true, 3, 1)).toBe(16); // 10 + 2 + 3 + 1
  });
});

describe('getAttunementSlots', () => {
  it('equals proficiency bonus', () => {
    expect(getAttunementSlots(2)).toBe(2);
    expect(getAttunementSlots(3)).toBe(3);
    expect(getAttunementSlots(6)).toBe(6);
  });
});
