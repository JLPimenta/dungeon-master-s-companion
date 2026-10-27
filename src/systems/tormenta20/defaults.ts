import type { CharacterCardData } from '../types';
import type { T20Sheet } from './types';
import { defaultSkillState, T20_SKILLS } from './skills';

/** Conteúdo padrão de uma ficha nova. Gêmeo no backend: tormenta20.system.ts → buildDefaultData. */
export function createDefaultT20Sheet(name: string): T20Sheet {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    system: 'tormenta20',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    isShared: false,

    name,
    level: 1,
    player: '',
    race: '',
    origin: '',
    class: '',
    deity: '',
    xp: 0,
    downtimePoints: 0,

    attributes: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 },
    skills: Object.fromEntries(T20_SKILLS.map(def => [def.key, defaultSkillState(def)])),

    hp: { max: 0, current: 0, temp: 0 },
    mp: { max: 0, current: 0, temp: 0 },

    defense: { attribute: 'des', other: 0, heavyArmor: false, attributeLimit: 0 },
    armor: { name: '', bonus: 0, penalty: 0 },
    shield: { name: '', bonus: 0, penalty: 0 },

    size: 'medio',
    speed: '9m',
    proficiencies: '',

    attacks: [],
    raceOriginAbilities: [],
    classAbilities: [],

    spellcasting: { attribute: 'int' },
    spells: [],

    equipment: [],
    money: { ts: 0, to: 0 },

    description: '',
    history: '',
    notes: '',

    campaignNotes: [],
    customFields: [],
  };
}

/** Card do dashboard. Gêmeo no backend: tormenta20.system.ts → buildCard. */
export function buildT20Card(sheet: Partial<T20Sheet>): CharacterCardData {
  const cls = sheet.class?.trim() ?? '';
  const origin = [sheet.race?.trim(), sheet.origin?.trim()].filter(Boolean).join(' · ');

  const details: CharacterCardData['details'] = [];
  if (cls) details.push({ kind: 'class', text: cls });
  if (origin) details.push({ kind: 'origin', text: origin });

  return {
    details,
    stats: [
      `PV ${sheet.hp?.current ?? 0}/${sheet.hp?.max ?? 0}`,
      `PM ${sheet.mp?.current ?? 0}/${sheet.mp?.max ?? 0}`,
    ],
  };
}
