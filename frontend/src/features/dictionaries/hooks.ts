// src/features/dictionaries/hooks.ts
import { useQuery } from '@tanstack/react-query';
import { dictionariesKeys } from './queryKeys';
import * as api from '../../shared/api/queries';

const TEN_MIN = 1000 * 60 * 10;
const THIRTY_MIN = 1000 * 60 * 30;

export function useStates() {
  return useQuery({
    queryKey: dictionariesKeys.states(),
    queryFn: api.getStates,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
  });
}

export function useAnrede() {
  return useQuery({
    queryKey: dictionariesKeys.anrede(),
    queryFn: api.getAnrede,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
  });
}
