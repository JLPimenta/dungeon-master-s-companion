import type { CharacterCardData } from '../types';
import type { AbilityKey, Skill } from '@/types/character';
import { getProficiencyBonus } from '@/utils/calculations';
import type { Dnd5eSheet } from './types';

/** As 18 perícias na tradução da ficha 5e (2014): "Blefar" em vez de "Enganação". */
const SKILLS_5E: Array<[string, AbilityKey]> = [
  ['Acrobacia', 'dexterity'],
  ['Arcanismo', 'intelligence'],
  ['Atletismo', 'strength'],
  ['Atuação', 'charisma'],
  ['Blefar', 'charisma'],
  ['Furtividade', 'dexterity'],
  ['História', 'intelligence'],
  ['Intimidação', 'charisma'],
  ['Intuição', 'wisdom'],
  ['Investigação', 'intelligence'],
  ['Lidar com Animais', 'wisdom'],
  ['Medicina', 'wisdom'],
  ['Natureza', 'intelligence'],
  ['Percepção', 'wisdom'],
  ['Persuasão', 'charisma'],
  ['Prestidigitação', 'dexterity'],
  ['Religião', 'intelligence'],
  ['Sobrevivência', 'wisdom'],
];

export const DEFAULT_SKILLS_5E: Skill[] = SKILLS_5E.map(([name, ability]) => ({
  name, ability, proficient: false, expertise: false,
}));

const ability = () => ({ value: 10, proficient: false });

/** Ficha nova. Gêmeo no backend: dnd5e.system.ts → buildDefaultData. */
export function createDefaultDnd5eSheet(name: string): Dnd5eSheet {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    system: 'dnd5e',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    isShared: false,

    name,
    level: 1,
    class: '',
    background: '',
    playerName: '',
    race: '',
    alignment: '',
    xp: 0,

    abilities: {
      strength: ability(), dexterity: ability(), constitution: ability(),
      intelligence: ability(), wisdom: ability(), charisma: ability(),
    },
    skills: DEFAULT_SKILLS_5E.map(s => ({ ...s })),
    bonuses: { proficiencyBonus: 0, initiative: 0, savingThrows: {}, skills: {} },

    armorClass: 10,
    hitPoints: { current: 10, max: 10, temp: 0 },
    hitDice: { total: '1d10', used: 0 },
    deathSaves: { successes: 0, failures: 0 },
    speed: 30,
    size: 'Médio',
    heroicInspiration: false,

    weapons: [],
    spellcastingAbility: '',
    spells: [],
    spellSlots: Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i + 1, { total: 0, used: 0 }]),
    ) as Dnd5eSheet['spellSlots'],

    inventory: [],
    attunedItems: [],
    coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },

    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    proficienciesAndLanguages: '',
    features: [],

    characteristics: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '' },
    appearance: '',
    backstory: '',
    alliesAndOrganizations: '',
    treasure: '',

    campaignNotes: [],
    customFields: [],
  };
}

/** Card do dashboard. Gêmeo no backend: dnd5e.system.ts → buildCard. */
export function buildDnd5eCard(sheet: Partial<Dnd5eSheet>): CharacterCardData {
  const cls = sheet.class?.trim() ?? '';
  const race = sheet.race?.trim() ?? '';

  const details: CharacterCardData['details'] = [];
  if (cls) details.push({ kind: 'class', text: cls });
  if (race) details.push({ kind: 'origin', text: race });

  return {
    details,
    stats: [
      `Proficiência +${getProficiencyBonus(sheet.level ?? 1)}`,
      `PV ${sheet.hitPoints?.current ?? 0}/${sheet.hitPoints?.max ?? 0}`,
    ],
  };
}
