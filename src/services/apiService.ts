import {CharacterService} from "@/services/characterService.ts";
import {CharacterSheet} from "@/types/character.ts";
import {getAuthToken} from "@/services/apiAuthService.ts";

const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options, headers
    })

    if (!response.ok) {
        const body = await response.json().catch(() => {})
        const message = body?.message ?? `Erro ${response.status}`

        throw new Error(Array.isArray(message) ? message.join(', ') : message)
    }

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
}

export const apiService: CharacterService = {
    getAll(): Promise<CharacterSheet[]> {
        return request<CharacterSheet[]>('/characters');
    },

    getById(id: string): Promise<CharacterSheet | null> {
        return request<CharacterSheet>(`/characters/${id}`)
            .catch((err: Error) => {
                if (err.message.includes('404')) return null
                throw err
        })
    },

    create(sheet: CharacterSheet): Promise<CharacterSheet> {
        return request<CharacterSheet>('/characters/', {
            method: 'POST',
            body: JSON.stringify(sheet)
        })
    },

    update(sheet: CharacterSheet): Promise<CharacterSheet> {
        return request<CharacterSheet>(`/characters/${sheet.id}`, {
            method: 'PUT',
            body: JSON.stringify(sheet)
        })
    },

    async delete(id: string): Promise<void> {
        await request<void>(`/characters/${id}`, { method: 'DELETE' });
    }

}