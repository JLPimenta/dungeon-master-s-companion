import type {CharacterService} from './characterService';
import {localStorageService} from './localStorageService';
import {apiService} from "@/services/apiService.ts";

// Swap VITE_USE_API in .env to switch implementations
export function getCharacterService(): CharacterService {
    return import.meta.env.VITE_USE_API === 'true'
        ? apiService
        : localStorageService;
}
