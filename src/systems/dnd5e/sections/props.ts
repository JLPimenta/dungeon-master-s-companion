import type { Dnd5eSheet } from '../types';

export interface Dnd5eSectionProps {
  sheet: Dnd5eSheet;
  onChange: (patch: Partial<Dnd5eSheet>) => void;
  onBlur?: () => void;
  readOnly?: boolean;
}
