import type { CharacterSheet } from '@/types/character';
import type { CharacterService } from './characterService';

const STORAGE_KEY = 'dnd_character_sheets';

function readAll(): CharacterSheet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(sheets: CharacterSheet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
}

export const localStorageService: CharacterService = {
  async getAll() {
    return readAll();
  },

  async getById(id: string) {
    return readAll().find(s => s.id === id) ?? null;
  },

  async create(sheet: CharacterSheet) {
    const sheets = readAll();
    const now = new Date().toISOString();
    const created = { ...sheet, createdAt: now, updatedAt: now };
    sheets.push(created);
    writeAll(sheets);
    return created;
  },

  async update(sheet: CharacterSheet) {
    const sheets = readAll();
    const updated = { ...sheet, updatedAt: new Date().toISOString() };
    const idx = sheets.findIndex(s => s.id === sheet.id);
    if (idx >= 0) {
      sheets[idx] = updated;
    } else {
      sheets.push(updated);
    }
    writeAll(sheets);
    return updated;
  },

  async delete(id: string) {
    writeAll(readAll().filter(s => s.id !== id));
  },
};
