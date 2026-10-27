import type { CharacterCardData, SheetEnvelope } from '../types';
import type { CampaignNote, CustomField, SheetEntry } from '../shared/types';

/*
 * Tormenta20 — Edição Jogo do Ano.
 *
 * Modelo próprio, sem herdar nada do D&D: atributos são o próprio
 * modificador (não há valor bruto), existe Mana, a Defesa é calculada de
 * outro jeito e as perícias somam ½ nível + treino.
 *
 * Gêmeo no backend: grimorio-api/src/modules/character/systems/tormenta20.system.ts
 */

export type T20Attribute = 'for' | 'des' | 'con' | 'int' | 'sab' | 'car';

export type T20Size = 'minusculo' | 'pequeno' | 'medio' | 'grande' | 'enorme' | 'colossal';

/** Estado de uma perícia na ficha. O catálogo (nome, regras) fica em skills.ts. */
export interface T20SkillState {
  trained: boolean;
  /** Atributo usado no teste. Alguns poderes trocam o atributo padrão. */
  attribute: T20Attribute;
  /** Bônus/penalidades de outras fontes (itens, poderes, condições). */
  other: number;
  /** Especialidade, para Ofício. Ex: "Ferreiro". */
  specialty?: string;
}

export interface T20Resource {
  max: number;
  current: number;
  temp: number;
}

export interface T20ArmorPiece {
  name: string;
  /** Bônus na Defesa. */
  bonus: number;
  /** Penalidade de armadura (valor positivo; é subtraído das perícias marcadas). */
  penalty: number;
}

export interface T20Attack {
  id: string;
  name: string;
  attackBonus: string;
  damage: string;
  critical: string;
  damageType: string;
  range: string;
  notes: string;
}

export type T20Ability = SheetEntry;

export type T20SpellCircle = 1 | 2 | 3 | 4 | 5;

export interface T20Spell {
  id: string;
  circle: T20SpellCircle;
  name: string;
  school: string;
  execution: string;
  range: string;
  /** Alvo ou área. */
  target: string;
  duration: string;
  resistance: string;
  description: string;
}

export interface T20Item {
  id: string;
  name: string;
  quantity: number;
  /** Espaços ocupados pela linha inteira (pode ser fracionário: 0,5). */
  spaces: number;
  /** Item vestido (máximo de 4 com benefício simultâneo). */
  worn: boolean;
  notes: string;
}

export interface T20Sheet extends SheetEnvelope {
  system?: 'tormenta20';
  card?: CharacterCardData;

  // Cabeçalho
  player: string;
  race: string;
  origin: string;
  class: string;
  deity: string;
  xp: number;
  downtimePoints: number;

  // Atributos (o valor já é o modificador)
  attributes: Record<T20Attribute, number>;

  // Perícias, por chave do catálogo
  skills: Record<string, T20SkillState>;

  // Recursos
  hp: T20Resource;
  mp: T20Resource;

  // Defesa
  defense: {
    attribute: T20Attribute;
    other: number;
    /** Armadura pesada: o atributo não entra (ou entra até o limite). */
    heavyArmor: boolean;
    attributeLimit: number;
  };
  armor: T20ArmorPiece;
  shield: T20ArmorPiece;

  size: T20Size;
  speed: string;
  proficiencies: string;

  attacks: T20Attack[];

  raceOriginAbilities: T20Ability[];
  classAbilities: T20Ability[];

  spellcasting: { attribute: T20Attribute };
  spells: T20Spell[];

  equipment: T20Item[];
  /** Tibares (T$) e tibares de ouro (TO). */
  money: { ts: number; to: number };

  description: string;
  history: string;
  notes: string;

  campaignNotes: CampaignNote[];
  customFields: CustomField[];
}
