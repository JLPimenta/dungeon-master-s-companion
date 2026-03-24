import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCharacterService } from '@/services/serviceProvider';
import type { CharacterSheet } from '@/types/character';
import { createDefaultCharacter } from '@/types/character';

const service = getCharacterService();
const QUERY_KEY = ['characters'];

export function useCharacters() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => service.getAll(),
  });
}

export function useCharacter(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => (id ? service.getById(id) : null),
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => {
      const sheet = createDefaultCharacter(name);
      return service.create(sheet);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useSaveCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sheet: CharacterSheet) => service.update(sheet),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
