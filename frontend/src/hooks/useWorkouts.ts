import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkout, updateWorkout, deleteWorkout, createFromTemplate, swapWorkouts } from '../api';
import type { Workout } from '../types';

export function useWorkouts(weekStart: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['week', weekStart] });
    queryClient.invalidateQueries({ queryKey: ['workouts', 'all'] });
  };

  const create = useMutation({
    mutationFn: (data: Partial<Workout> & { date: string; workout_type: string }) =>
      createWorkout(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Workout> }) =>
      updateWorkout(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteWorkout(id),
    onSuccess: invalidate,
  });

  const fromTemplate = useMutation({
    mutationFn: ({ templateId, date }: { templateId: number; date: string }) =>
      createFromTemplate(templateId, date),
    onSuccess: invalidate,
  });

  const swap = useMutation({
    mutationFn: ({ id1, id2 }: { id1: number; id2: number }) =>
      swapWorkouts(id1, id2),
    onSuccess: invalidate,
  });

  return {
    createWorkout: create.mutate,
    updateWorkout: update.mutate,
    deleteWorkout: remove.mutate,
    createFromTemplate: fromTemplate.mutate,
    swapWorkouts: swap.mutate,
  };
}
