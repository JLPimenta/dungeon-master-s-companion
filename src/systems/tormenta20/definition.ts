import { defineSystem } from '../types';
import type { T20Sheet } from './types';
import { buildT20Card, createDefaultT20Sheet } from './defaults';
import { T20SheetLayout } from './T20SheetLayout';

export const tormenta20System = defineSystem<T20Sheet>({
  id: 'tormenta20',
  label: 'Tormenta20 (Jogo do Ano)',
  shortLabel: 'Tormenta20',
  description: 'Mana, perícias por treino e ½ nível, magias por círculo e carga em espaços.',
  createDefault: createDefaultT20Sheet,
  SheetComponent: T20SheetLayout,
  buildCard: buildT20Card,
});
