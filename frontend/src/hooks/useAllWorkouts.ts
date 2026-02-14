import { useQuery } from '@tanstack/react-query';
import { fetchAllWorkouts } from '../api';

export function useAllWorkouts() {
  return useQuery({
    queryKey: ['workouts', 'all'],
    queryFn: fetchAllWorkouts,
  });
}
