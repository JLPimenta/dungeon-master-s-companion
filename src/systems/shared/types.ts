/*
 * Recursos do Grimório que valem para qualquer sistema de jogo
 * (não são regra de sistema nenhum). Seções que dependem só destes
 * tipos podem ser reaproveitadas por todos os módulos em src/systems/.
 */

export interface CampaignNote {
  id: string;
  category: 'npcs' | 'locations' | 'events' | 'general';
  title: string;
  content: string;
}

export interface CustomField {
  id: string;
  section: string;
  label: string;
  value: string;
}

/** Entrada nome + descrição: habilidades, poderes, talentos, traços. */
export interface SheetEntry {
  id: string;
  name: string;
  description: string;
}
