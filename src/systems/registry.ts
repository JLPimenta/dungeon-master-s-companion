import type {AnySheet, SystemDefinition, SystemId} from './types';
import {DEFAULT_SYSTEM_ID} from './types';
import {dnd55System} from './dnd5_5e/definition';
import {tormenta20System} from './tormenta20/definition';
import {dnd5eSystem} from './dnd5e/definition';

/*
 * Único ponto do frontend que conhece todos os sistemas.
 * Adicionar uma ficha nova = criar src/systems/<id>/ e registrar aqui
 * (e o gêmeo em grimorio-api/src/modules/character/systems/registry.ts).
 */
const REGISTRY: Partial<Record<SystemId, SystemDefinition<AnySheet>>> = {
    dnd5_5e: dnd55System as unknown as SystemDefinition<AnySheet>,
    tormenta20: tormenta20System as unknown as SystemDefinition<AnySheet>,
    dnd5e: dnd5eSystem as unknown as SystemDefinition<AnySheet>,
};

export const AVAILABLE_SYSTEMS: SystemDefinition<AnySheet>[] = Object.values(REGISTRY);

/** Fichas sem `system` são anteriores à migração: eram todas 5.5e. */
function systemIdOf(sheetOrId: { system?: SystemId } | SystemId | undefined): SystemId {
    if (typeof sheetOrId === 'string') return sheetOrId;
    return sheetOrId?.system ?? DEFAULT_SYSTEM_ID;
}

/** Retorna undefined para sistemas que este build do frontend não conhece. */
export function findSystem(sheetOrId: { system?: SystemId } | SystemId | undefined) {
    return REGISTRY[systemIdOf(sheetOrId)];
}

export function resolveSystem(sheetOrId: { system?: SystemId } | SystemId | undefined): SystemDefinition<AnySheet> {
    const def = findSystem(sheetOrId);
    if (!def) {
        throw new Error(`Sistema de jogo não suportado: "${systemIdOf(sheetOrId)}".`);
    }
    return def;
}
