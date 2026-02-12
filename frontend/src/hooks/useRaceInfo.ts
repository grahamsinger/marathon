import { useQuery } from '@tanstack/react-query';
import { getRaceInfo } from '../api';

export function useRaceInfo() {
  return useQuery({
    queryKey: ['race-info'],
    queryFn: getRaceInfo,
  });
}
