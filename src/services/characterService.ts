import type { AnySheet, SheetListItem } from '@/systems/types';

/**
 * Transporte de fichas. Não interpreta o conteúdo: qualquer sistema passa
 * por aqui como `AnySheet` (envelope + campos do sistema, achatados).
 */
export interface CharacterService {
  /** Listagem do dashboard. A API devolve só envelope + card. */
  getAll(): Promise<SheetListItem[]>;
  getById(id: string): Promise<AnySheet | null>;
  create(sheet: AnySheet): Promise<AnySheet>;
  update(sheet: AnySheet): Promise<AnySheet>;
  delete(id: string): Promise<void>;
}
