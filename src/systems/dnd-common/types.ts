import type { CharacterSheet } from '@/types/character';

/*
 * Núcleo da família D&D (5e de 2014 e 5.5e de 2024).
 *
 * As duas edições têm modelos de dados próprios (ids, tipos e schemas
 * separados), mas compartilham a mecânica da ficha: atributos com valor e
 * modificador, proficiência por nível, perícias, salvaguardas, CA, PV, dados
 * de vida, ataques, espaços de magia e moedas. As seções que só dependem
 * destes campos (components/sheet/: AbilityScores, SkillsSection,
 * CombatSection, WeaponsTable, SpellcastingSection, InventorySection) servem
 * às duas edições.
 *
 * Regra: um campo só entra aqui se tiver o MESMO formato e a MESMA regra nas
 * duas edições. Diferença de rótulo vira prop da seção (ex.: rótulo da
 * inspiração); diferença de regra vira seção própria do sistema.
 */
export type DndCoreSheet = Pick<
  CharacterSheet,
  | 'level'
  | 'abilities'
  | 'skills'
  | 'bonuses'
  | 'armorClass'
  | 'hitPoints'
  | 'hitDice'
  | 'deathSaves'
  | 'speed'
  | 'size'
  | 'heroicInspiration'
  | 'weapons'
  | 'spells'
  | 'spellSlots'
  | 'spellcastingAbility'
  | 'inventory'
  | 'attunedItems'
  | 'coins'
>;

/** Props das seções compartilhadas da família D&D. */
export interface DndSectionProps {
  sheet: DndCoreSheet;
  onChange: (patch: Partial<DndCoreSheet>) => void;
  onBlur?: () => void;
}
