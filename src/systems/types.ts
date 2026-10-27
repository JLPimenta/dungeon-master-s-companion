import type {ComponentType} from 'react';

/*
 * Contrato de um sistema de jogo no frontend.
 *
 * Regra da arquitetura: páginas, dashboard, hooks e services só conhecem os
 * tipos DESTE arquivo. Tudo que é regra de um sistema (campos, cálculos,
 * layout) mora em src/systems/<id>/ e só é alcançado via registry.
 *
 * Gêmeo no backend: src/modules/character/systems/system.types.ts.
 */

/** Persistido no banco — nunca renomear um id existente sem migração. */
export type SystemId = 'dnd5_5e' | 'dnd5e' | 'tormenta20';

export const DEFAULT_SYSTEM_ID: SystemId = 'dnd5_5e';

/** Resumo para o card do dashboard (derivado no servidor a cada save). */
export interface CharacterCardData {
    /** `kind` decide o ícone: classe ou origem (espécie, raça, ascendência...). */
    details: { kind: 'class' | 'origin'; text: string }[];
    /** Estatísticas curtas, já formatadas. Ex: "PV 10/10" */
    stats: string[];
}

/** Campos comuns a qualquer ficha, independente de sistema. */
export interface SheetEnvelope {
    id: string;
    /** Ausente apenas em fichas antigas do localStorage (tratadas como dnd5_5e). */
    system?: SystemId;
    schemaVersion?: number;
    name: string;
    level: number;
    isShared?: boolean;
    card?: CharacterCardData;
    createdAt: string;
    updatedAt: string;
}

/** Ficha de sistema desconhecido em tempo de compilação (cache, services, páginas). */
export type AnySheet = SheetEnvelope & Record<string, unknown>;

/**
 * Item da listagem do dashboard. A API devolve só o envelope + card;
 * o localStorage devolve a ficha inteira. Por isso o resto é opcional.
 */
export type SheetListItem = SheetEnvelope & Record<string, unknown>;

export interface SheetComponentProps<T extends SheetEnvelope = AnySheet> {
    sheet: T;
    onChange: (patch: Partial<T>) => void;
    /** Disparado ao sair de um campo — a página usa para salvar. */
    onBlur?: () => void;
    /** Visualização compartilhada: nada é persistido e seções privadas somem. */
    readOnly?: boolean;
}

export interface SystemDefinition<T extends SheetEnvelope = AnySheet> {
    id: SystemId;

    /** Nome completo. Ex: "Dungeons & Dragons 5.5e (2024)" */
    label: string;

    /** Rótulo curto para badges. Ex: "D&D 5.5e" */
    shortLabel: string;

    /** Uma linha para o dialog de criação. */
    description: string;

    /**
     * Ficha nova com os valores padrão do sistema. Usada no modo localStorage;
     * no modo API quem gera os defaults é o backend.
     */
    createDefault: (name: string) => T;

    /** Layout completo da ficha (composição das seções do sistema). */
    SheetComponent: ComponentType<SheetComponentProps<T>>;

    /**
     * Card do dashboard calculado no cliente. Usado quando o item não traz
     * `card` (modo localStorage ou API anterior à migração).
     * Gêmeo de `buildCard` no backend — manter em sincronia.
     */
    buildCard: (sheet: Partial<T> & SheetEnvelope) => CharacterCardData;
}

/** Mantém a inferência de T ao declarar um sistema. */
export function defineSystem<T extends SheetEnvelope>(def: SystemDefinition<T>): SystemDefinition<T> {
    return def;
}
