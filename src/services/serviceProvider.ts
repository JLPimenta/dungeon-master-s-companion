import type { CharacterService } from './characterService';
import { localStorageService } from './localStorageService';

// Swap this function's return to switch implementations
// e.g. capacitorStorageService or apiService
export function getCharacterService(): CharacterService {
  return localStorageService;
}
