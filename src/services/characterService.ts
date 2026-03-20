import type { CharacterSheet } from '@/types/character';

export interface CharacterService {
  getAll(): Promise<CharacterSheet[]>;
  getById(id: string): Promise<CharacterSheet | null>;
  save(sheet: CharacterSheet): Promise<CharacterSheet>;
  delete(id: string): Promise<void>;
}
