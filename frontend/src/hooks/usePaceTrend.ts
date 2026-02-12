import { useQuery } from '@tanstack/react-query';
import { getPaceTrend } from '../api';

export function usePaceTrend() {
  return useQuery({
    queryKey: ['pace-trend'],
    queryFn: getPaceTrend,
  });
}
