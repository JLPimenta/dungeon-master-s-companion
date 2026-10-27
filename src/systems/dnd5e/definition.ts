import { defineSystem } from '../types';
import type { Dnd5eSheet } from './types';
import { buildDnd5eCard, createDefaultDnd5eSheet } from './defaults';
import { Dnd5eSheetLayout } from './Dnd5eSheetLayout';

export const dnd5eSystem = defineSystem<Dnd5eSheet>({
  id: 'dnd5e',
  label: 'Dungeons & Dragons 5e (2014)',
  shortLabel: 'D&D 5e',
  description: 'Regras de 2014: raças, tendência, traços de personalidade, ideais, ligações e defeitos.',
  createDefault: createDefaultDnd5eSheet,
  SheetComponent: Dnd5eSheetLayout,
  buildCard: buildDnd5eCard,
});
