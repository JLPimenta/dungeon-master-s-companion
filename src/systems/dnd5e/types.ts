import type { CharacterCardData, SheetEnvelope } from '../types';
import type { DndCoreSheet } from '../dnd-common/types';
import type { CampaignNote, CustomField, SheetEntry } from '../shared/types';

/*
 * D&D 5e (regras de 2014), pela ficha oficial traduzida (Biblioteca Élfica).
 *
 * Modelo próprio, separado do 5.5e: id de sistema, tipo e schema são
 * independentes. Só a mecânica de ficha que é idêntica nas duas edições vem
 * do núcleo D&D (DndCoreSheet) — e, com ela, as seções que a exibem.
 *
 * Observação: a inspiração usa o campo `heroicInspiration` do núcleo (o nome
 * é interno; na tela aparece "Inspiração").
 *
 * Gêmeo no backend: grimorio-api/src/modules/character/systems/dnd5e.system.ts
 */
export interface Dnd5eCharacteristics {
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
}

export type Dnd5eSheet = SheetEnvelope & DndCoreSheet & {
  system?: 'dnd5e';
  card?: CharacterCardData;

  // Cabeçalho
  class: string;
  background: string;
  playerName: string;
  race: string;
  alignment: string;
  xp: number;

  // Personalidade
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  proficienciesAndLanguages: string;
  features: SheetEntry[];

  // Página 2 da ficha
  characteristics: Dnd5eCharacteristics;
  appearance: string;
  backstory: string;
  alliesAndOrganizations: string;
  treasure: string;

  campaignNotes: CampaignNote[];
  customFields: CustomField[];
};
