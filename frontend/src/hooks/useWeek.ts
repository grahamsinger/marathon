import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWeek, updateWeek } from '../api';

export function useWeek(weekStart: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['week', weekStart],
    queryFn: () => getWeek(weekStart),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { mileage_target?: number; notes?: string }) =>
      updateWeek(weekStart, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['week', weekStart] });
    },
  });

  return { ...query, updateWeek: updateMutation.mutate };
}
