import type {CharacterCardData} from '../types';
import {defineSystem} from '../types';
import type {CharacterSheet} from '@/types/character';
import {createDefaultCharacter} from '@/types/character';
import {getProficiencyBonus} from '@/utils/calculations';
import {Dnd55SheetLayout} from './Dnd55SheetLayout';

/*
 * D&D 5.5e (regras de 2024).
 *
 * Fase 1a: os tipos (types/character.ts), cálculos (utils/calculations.ts) e
 * seções (components/sheet/) continuam onde estavam, mas só são importados a
 * partir deste módulo. Fase 1b: movê-los para dentro de src/systems/dnd5_5e/.
 *
 * Gêmeo no backend: grimorio-api/src/modules/character/systems/dnd5_5e.system.ts
 */

export type Dnd55Sheet = CharacterSheet & {
    system?: 'dnd5_5e';
    schemaVersion?: number;
    card?: CharacterCardData;
};

function buildCard(sheet: Partial<Dnd55Sheet>): CharacterCardData {
    const cls = sheet.class?.trim() ?? '';
    const subclass = sheet.subclass?.trim() ?? '';
    const species = sheet.species?.trim() ?? '';

    const details: CharacterCardData['details'] = [];
    if (cls) details.push({kind: 'class', text: subclass ? `${cls} — ${subclass}` : cls});
    if (species) details.push({kind: 'origin', text: species});

    return {
        details,
        stats: [
            `Proficiência +${getProficiencyBonus(sheet.level ?? 1)}`,
            `PV ${sheet.hitPoints?.current ?? 0}/${sheet.hitPoints?.max ?? 0}`,
        ],
    };
}

export const dnd55System = defineSystem<Dnd55Sheet>({
    id: 'dnd5_5e',
    label: 'Dungeons & Dragons 5.5e (2024)',
    shortLabel: 'D&D 5.5e',
    description: '',

    createDefault: (name) => ({
        ...createDefaultCharacter(name),
        system: 'dnd5_5e',
        schemaVersion: 1,
    }),

    SheetComponent: Dnd55SheetLayout,

    buildCard,
});
