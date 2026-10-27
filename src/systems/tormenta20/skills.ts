import type { T20Attribute, T20SkillState } from './types';

export interface T20SkillDefinition {
  key: string;
  name: string;
  attribute: T20Attribute;
  /** Só pode ser usada se treinada (na ficha: "ND" quando não treinada). */
  trainedOnly: boolean;
  /** Sofre penalidade de armadura. */
  armorPenalty: boolean;
  /** Ofício: exige especialidade. */
  hasSpecialty?: boolean;
}

/**
 * As 29 perícias do Tormenta20 (Ofício aparece duas vezes, como na ficha
 * oficial). A ordem é a da ficha. Gêmeo no backend: tormenta20.system.ts.
 */
export const T20_SKILLS: T20SkillDefinition[] = [
  { key: 'acrobacia', name: 'Acrobacia', attribute: 'des', trainedOnly: false, armorPenalty: true },
  { key: 'adestramento', name: 'Adestramento', attribute: 'car', trainedOnly: true, armorPenalty: false },
  { key: 'atletismo', name: 'Atletismo', attribute: 'for', trainedOnly: false, armorPenalty: false },
  { key: 'atuacao', name: 'Atuação', attribute: 'car', trainedOnly: false, armorPenalty: false },
  { key: 'cavalgar', name: 'Cavalgar', attribute: 'des', trainedOnly: false, armorPenalty: false },
  { key: 'conhecimento', name: 'Conhecimento', attribute: 'int', trainedOnly: true, armorPenalty: false },
  { key: 'cura', name: 'Cura', attribute: 'sab', trainedOnly: false, armorPenalty: false },
  { key: 'diplomacia', name: 'Diplomacia', attribute: 'car', trainedOnly: false, armorPenalty: false },
  { key: 'enganacao', name: 'Enganação', attribute: 'car', trainedOnly: false, armorPenalty: false },
  { key: 'fortitude', name: 'Fortitude', attribute: 'con', trainedOnly: false, armorPenalty: false },
  { key: 'furtividade', name: 'Furtividade', attribute: 'des', trainedOnly: false, armorPenalty: true },
  { key: 'guerra', name: 'Guerra', attribute: 'int', trainedOnly: true, armorPenalty: false },
  { key: 'iniciativa', name: 'Iniciativa', attribute: 'des', trainedOnly: false, armorPenalty: false },
  { key: 'intimidacao', name: 'Intimidação', attribute: 'car', trainedOnly: false, armorPenalty: false },
  { key: 'intuicao', name: 'Intuição', attribute: 'sab', trainedOnly: false, armorPenalty: false },
  { key: 'investigacao', name: 'Investigação', attribute: 'int', trainedOnly: false, armorPenalty: false },
  { key: 'jogatina', name: 'Jogatina', attribute: 'car', trainedOnly: true, armorPenalty: false },
  { key: 'ladinagem', name: 'Ladinagem', attribute: 'des', trainedOnly: true, armorPenalty: true },
  { key: 'luta', name: 'Luta', attribute: 'for', trainedOnly: false, armorPenalty: false },
  { key: 'misticismo', name: 'Misticismo', attribute: 'int', trainedOnly: true, armorPenalty: false },
  { key: 'nobreza', name: 'Nobreza', attribute: 'int', trainedOnly: true, armorPenalty: false },
  { key: 'oficio1', name: 'Ofício', attribute: 'int', trainedOnly: true, armorPenalty: false, hasSpecialty: true },
  { key: 'oficio2', name: 'Ofício', attribute: 'int', trainedOnly: true, armorPenalty: false, hasSpecialty: true },
  { key: 'percepcao', name: 'Percepção', attribute: 'sab', trainedOnly: false, armorPenalty: false },
  { key: 'pilotagem', name: 'Pilotagem', attribute: 'des', trainedOnly: true, armorPenalty: false },
  { key: 'pontaria', name: 'Pontaria', attribute: 'des', trainedOnly: false, armorPenalty: false },
  { key: 'reflexos', name: 'Reflexos', attribute: 'des', trainedOnly: false, armorPenalty: false },
  { key: 'religiao', name: 'Religião', attribute: 'sab', trainedOnly: true, armorPenalty: false },
  { key: 'sobrevivencia', name: 'Sobrevivência', attribute: 'sab', trainedOnly: false, armorPenalty: false },
  { key: 'vontade', name: 'Vontade', attribute: 'sab', trainedOnly: false, armorPenalty: false },
];

export function defaultSkillState(def: T20SkillDefinition): T20SkillState {
  return {
    trained: false,
    attribute: def.attribute,
    other: 0,
    ...(def.hasSpecialty ? { specialty: '' } : {}),
  };
}

/**
 * Estado de uma perícia, com fallback para o catálogo. Fichas salvas antes
 * de uma perícia existir no catálogo continuam funcionando.
 */
export function skillState(skills: Record<string, T20SkillState> | undefined, def: T20SkillDefinition): T20SkillState {
  return { ...defaultSkillState(def), ...(skills?.[def.key] ?? {}) };
}
