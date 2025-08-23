// src/features/resumes/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resumesKeys } from './queryKeys';
import {
  changeResumeStatus,
  getCompanies,
  getContacts,
  getHistoryByResumeId,
  getResumeById,
  getResumesWithUsers,
  updateOrCreateResume,
} from '../../shared/api/queries';

const TEN_MIN = 1000 * 60 * 10;

export function useResumesWithUsers() {
  return useQuery({
    queryKey: resumesKeys.list(),
    queryFn: getResumesWithUsers,
    staleTime: TEN_MIN,
  });
}

export function useResumeById(resumeId: number, refId: number, enabled = true) {
  return useQuery({
    queryKey: resumesKeys.byId(resumeId, refId),
    queryFn: () => getResumeById({ resumeId, refId }),
    enabled,
    staleTime: TEN_MIN,
  });
}

export function useUpsertResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateOrCreateResume,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumesKeys.list() });
    },
  });
}

export function useResumeHistory(resumeId: number, refId: number, enabled = true) {
  return useQuery({
    queryKey: resumesKeys.history(resumeId, refId),
    queryFn: () => getHistoryByResumeId({ resumeId, refId }),
    enabled,
    staleTime: TEN_MIN,
  });
}

export function useChangeResumeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: changeResumeStatus,
    onSuccess: (_data, variables) => {
      // variables enthält { resumeId, stateId, date }
      if (variables) {
        const resumeId = variables.resumeId;
        // refId ist nicht bekannt -> invalidiere alle Detail- und History-Queries
        qc.invalidateQueries({ queryKey: resumesKeys.all });
      } else {
        qc.invalidateQueries({ queryKey: resumesKeys.all });
      }
    },
  });
}

export function useCompanies(isRecruter: boolean = false) {
  return useQuery({
    queryKey: resumesKeys.companies(isRecruter),
    queryFn: () => getCompanies(isRecruter),
    staleTime: TEN_MIN,
  });
}

export function useContacts(refId: number, companyId: number, enabled = true) {
  return useQuery({
    queryKey: resumesKeys.contacts(refId, companyId),
    queryFn: () => getContacts({ refId, companyId }),
    enabled,
    staleTime: TEN_MIN,
  });
}
