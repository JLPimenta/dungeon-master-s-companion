import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCharacterService } from '@/services/serviceProvider';
import { resolveSystem } from '@/systems/registry';
import type { AnySheet, SheetListItem, SystemId } from '@/systems/types';

const QUERY_KEY = ['characters'];

export function useCharacters() {
  const service = getCharacterService();
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => service.getAll(),
  });
}

export function useCharacter(id: string | undefined) {
  const service = getCharacterService();
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => (id ? service.getById(id) : null),
    enabled: !!id,
  });
}

export interface CreateCharacterInput {
  name: string;
  system: SystemId;
}

export function useCreateCharacter() {
  const service = getCharacterService();
  const qc = useQueryClient();
  return useMutation({
    // Os defaults vêm do módulo do sistema escolhido (no modo API, o backend
    // ignora o resto e gera os próprios defaults a partir de nome + sistema).
    mutationFn: ({ name, system }: CreateCharacterInput) => {
      const sheet = resolveSystem(system).createDefault(name);
      return service.create(sheet);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useSaveCharacter() {
  const service = getCharacterService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sheet: AnySheet) => service.update(sheet),
    onSuccess: (updatedSheet) => {
      qc.setQueryData<SheetListItem[]>(QUERY_KEY, (old) =>
        old?.map((char) => (char.id === updatedSheet.id ? updatedSheet : char))
      );
      qc.setQueryData<AnySheet>([...QUERY_KEY, updatedSheet.id], updatedSheet);
    },
  });
}

export function useDeleteCharacter() {
  const service = getCharacterService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
