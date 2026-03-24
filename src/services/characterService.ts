import type { CharacterSheet } from '@/types/character';

export interface CharacterService {
  getAll(): Promise<CharacterSheet[]>;
  getById(id: string): Promise<CharacterSheet | null>;
  create(sheet: CharacterSheet): Promise<CharacterSheet>;
  update(sheet: CharacterSheet): Promise<CharacterSheet>;
  delete(id: string): Promise<void>;
}
