import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api';
import type { WorkoutTemplate } from '../types';

export function useTemplates() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const create = useMutation({
    mutationFn: (data: Omit<WorkoutTemplate, 'id'>) => createTemplate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkoutTemplate> }) =>
      updateTemplate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  return {
    templates: query.data ?? [],
    isLoading: query.isLoading,
    createTemplate: create.mutate,
    updateTemplate: update.mutate,
    deleteTemplate: remove.mutate,
  };
}
