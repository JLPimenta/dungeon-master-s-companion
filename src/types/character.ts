export interface AbilityScore {
  value: number;
  proficient: boolean; // salvaguarda
}

export interface Skill {
  name: string;
  ability: AbilityKey;
  proficient: boolean;
  expertise: boolean;
}

export type AbilityKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  strength: 'Força',
  dexterity: 'Destreza',
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  wisdom: 'Sabedoria',
  charisma: 'Carisma',
};

export const ABILITY_ABBR: Record<AbilityKey, string> = {
  strength: 'FOR',
  dexterity: 'DES',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'SAB',
  charisma: 'CAR',
};

/**
 * Bônus manuais para campos calculados (somente leitura).
 * Usados para itens mágicos, antecedentes e outras fontes externas
 * que modificam valores derivados sem alterar os atributos base.
 *
 * Exemplos:
 *   - Manto da Proteção: savingThrows.strength = 1, .dexterity = 1 … (todos +1)
 *   - Antecedente Criminoso: initiative = proficiencyBonus calculado externamente → initiative = 3
 *   - Orbe sintonizado: proficiencyBonus = 2
 *   - Botas de Velocidade: skills.Furtividade = 2
 */
export interface CharacterBonuses {
  proficiencyBonus: number;
  initiative: number;
  savingThrows: Partial<Record<AbilityKey, number>>;
  skills: Partial<Record<string, number>>;
}

export interface Weapon {
  id: string;
  name: string;
  attackBonus: string;
  damage: string;
  damageType: string;
  notes: string;
}

export interface Spell {
  id: string;
  level: number; // 0 = cantrip
  name: string;
  castingTime: string;
  range: string;
  concentration: boolean;
  ritual: boolean;
  notes: string;
  materialRequired: string;
}

export interface SpellSlots {
  total: number;
  used: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  notes: string;
}

export interface AttunedItem {
  id: string;
  name: string;
  description: string;
}

export interface Coins {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface CampaignNote {
  id: string;
  category: 'npcs' | 'locations' | 'events' | 'general';
  title: string;
  content: string;
}

export interface CustomField {
  id: string;
  section: string;
  label: string;
  value: string;
}

export const DEFAULT_SKILLS: Skill[] = [
  { name: 'Acrobacia', ability: 'dexterity', proficient: false, expertise: false },
  { name: 'Arcanismo', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Atletismo', ability: 'strength', proficient: false, expertise: false },
  { name: 'Atuação', ability: 'charisma', proficient: false, expertise: false },
  { name: 'Enganação', ability: 'charisma', proficient: false, expertise: false },
  { name: 'Furtividade', ability: 'dexterity', proficient: false, expertise: false },
  { name: 'História', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Intimidação', ability: 'charisma', proficient: false, expertise: false },
  { name: 'Intuição', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Investigação', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Lidar com Animais', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Medicina', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Natureza', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Percepção', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Persuasão', ability: 'charisma', proficient: false, expertise: false },
  { name: 'Prestidigitação', ability: 'dexterity', proficient: false, expertise: false },
  { name: 'Religião', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Sobrevivência', ability: 'wisdom', proficient: false, expertise: false },
];

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface CharacterSheet {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Header
  name: string;
  class: string;
  level: number;
  background: string;
  species: string;
  subclass: string;
  xp: number;

  // Abilities
  abilities: Record<AbilityKey, AbilityScore>;

  // Skills
  skills: Skill[];

  // Combat
  armorClass: number;
  hitPoints: { current: number; max: number; temp: number };
  hitDice: { total: string; used: number };
  deathSaves: DeathSaves;
  initiative: number;
  speed: number;
  size: string;

  // Inspiration
  heroicInspiration: boolean;

  // Weapons
  weapons: Weapon[];

  // Features
  classFeatures: string[];
  speciesTraits: string;
  feats: string;

  // Equipment training
  armorTraining: string;
  weaponTraining: string;
  toolTraining: string;

  // Spellcasting
  spellcastingAbility: AbilityKey | '';
  spells: Spell[];
  spellSlots: Record<number, SpellSlots>;

  // Inventory
  inventory: InventoryItem[];
  attunedItems: AttunedItem[];
  coins: Coins;

  // Personality
  personalityAndHistory: string;
  alignment: string;
  languages: string;

  // Campaign Notes
  campaignNotes: CampaignNote[];

  // Custom Fields
  customFields: CustomField[];

  // Manual bonuses for computed (read-only) fields
  bonuses: CharacterBonuses;

  // Sharing
  isShared?: boolean;
}

const DEFAULT_BONUSES: CharacterBonuses = {
  proficiencyBonus: 0,
  initiative: 0,
  savingThrows: {},
  skills: {},
};

export function createDefaultCharacter(name: string): CharacterSheet {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    name,
    class: '',
    level: 1,
    background: '',
    species: '',
    subclass: '',
    xp: 0,
    abilities: {
      strength: { value: 10, proficient: false },
      dexterity: { value: 10, proficient: false },
      constitution: { value: 10, proficient: false },
      intelligence: { value: 10, proficient: false },
      wisdom: { value: 10, proficient: false },
      charisma: { value: 10, proficient: false },
    },
    skills: DEFAULT_SKILLS.map(s => ({ ...s })),
    armorClass: 10,
    hitPoints: { current: 10, max: 10, temp: 0 },
    hitDice: { total: '1d10', used: 0 },
    deathSaves: { successes: 0, failures: 0 },
    initiative: 0,
    speed: 30,
    size: 'Médio',
    heroicInspiration: false,
    weapons: [],
    classFeatures: [],
    speciesTraits: '',
    feats: '',
    armorTraining: '',
    weaponTraining: '',
    toolTraining: '',
    spellcastingAbility: '',
    spells: [],
    spellSlots: {
      1: { total: 0, used: 0 },
      2: { total: 0, used: 0 },
      3: { total: 0, used: 0 },
      4: { total: 0, used: 0 },
      5: { total: 0, used: 0 },
      6: { total: 0, used: 0 },
      7: { total: 0, used: 0 },
      8: { total: 0, used: 0 },
      9: { total: 0, used: 0 },
    },
    inventory: [],
    attunedItems: [],
    coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    personalityAndHistory: '',
    alignment: '',
    languages: '',
    campaignNotes: [],
    customFields: [],
    bonuses: { ...DEFAULT_BONUSES, savingThrows: {}, skills: {} },
    isShared: false,
  };
}